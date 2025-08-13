import React, { useState, useEffect } from 'react';
import Header from './Header.jsx';
import { useCart } from './CartContext.jsx';
import { useAuth } from './AuthContext.jsx';
import Swal from 'sweetalert2';

const CATEGORY_ALL = 'All';
const CATEGORY_TOP_RATED = 'Top Rated';

const Menu = () => {
  // All hooks at the top
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
  const [modalProduct, setModalProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productsData, setProductsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('name');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistLastFetched, setWishlistLastFetched] = useState(null);

  // Advanced Filtering States
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    nutFree: false
  });
  
  const [allergyFilters, setAllergyFilters] = useState({
    milk: false,
    eggs: false,
    nuts: false,
    gluten: false,
    soy: false
  });
  
  const [calorieRange, setCalorieRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [preparationTime, setPreparationTime] = useState('all'); // 'quick', 'slow', 'all'
  const [modalQuantity, setModalQuantity] = useState(1);

  const { token } = useAuth();

  // Cache duration: 5 minutes (300000ms)
  const CACHE_DURATION = 5 * 60 * 1000;

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/products')
      .then(res => res.json())
      .then((products) => {
        setProductsData(products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Reset modal quantity when modal opens
  useEffect(() => {
    if (modalProduct) {
      setModalQuantity(1);
    }
  }, [modalProduct]);

  // Load wishlist from database when user is authenticated (with caching)
  useEffect(() => {
    if (token) {
      loadWishlist();
    } else {
      setWishlist([]);
      setWishlistLastFetched(null);
      // Clear localStorage cache when user logs out
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('wishlist_')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }, [token]);

  const loadWishlist = async (forceRefresh = false) => {
    if (!token) return;
    
    // Check if we have cached data and it's still valid
    const now = Date.now();
    const isCacheValid = wishlistLastFetched && (now - wishlistLastFetched < CACHE_DURATION);
    
    if (!forceRefresh && isCacheValid && wishlist.length > 0) {
      console.log('Using cached wishlist data');
      return;
    }
    
    // Check localStorage as fallback cache
    if (!forceRefresh && !isCacheValid) {
      const cachedWishlist = localStorage.getItem(`wishlist_${token}`);
      const cachedTimestamp = localStorage.getItem(`wishlist_timestamp_${token}`);
      
      if (cachedWishlist && cachedTimestamp) {
        const cacheAge = now - parseInt(cachedTimestamp);
        if (cacheAge < CACHE_DURATION) {
          try {
            const parsedWishlist = JSON.parse(cachedWishlist);
            setWishlist(parsedWishlist);
            setWishlistLastFetched(parseInt(cachedTimestamp));
            console.log('Using localStorage cached wishlist data');
            return;
          } catch (error) {
            console.error('Error parsing cached wishlist:', error);
          }
        }
      }
    }
    
    try {
      setWishlistLoading(true);
      const response = await fetch('http://localhost:3001/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const wishlistData = await response.json();
        const wishlistIds = wishlistData.map(item => item.productId._id || item.productId);
        setWishlist(wishlistIds);
        setWishlistLastFetched(now);
        
        // Cache in localStorage as fallback
        localStorage.setItem(`wishlist_${token}`, JSON.stringify(wishlistIds));
        localStorage.setItem(`wishlist_timestamp_${token}`, now.toString());
        
        console.log('Wishlist fetched from database');
      } else {
        console.error('Failed to load wishlist');
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    // Trigger animation when component comes into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.querySelector('#menu-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const { addToCart } = useCart();

  // Wishlist functions
  const toggleWishlist = async (productId) => {
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Please Sign In',
        text: 'You need to be signed in to use the wishlist feature.',
        showConfirmButton: true,
        confirmButtonText: 'Sign In',
        background: '#fffbe6',
        color: '#3b2f2f',
        iconColor: '#b8860b',
      });
      return;
    }

    try {
      const isCurrentlyInWishlist = wishlist.includes(productId);
      
      // Optimistic update - update UI immediately
      if (isCurrentlyInWishlist) {
        setWishlist(prev => prev.filter(id => id !== productId));
      } else {
        setWishlist(prev => [...prev, productId]);
      }
      
      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        const response = await fetch(`http://localhost:3001/wishlist/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'Removed from wishlist',
            showConfirmButton: false,
            timer: 1200,
            timerProgressBar: true,
            background: '#fffbe6',
            color: '#3b2f2f',
            iconColor: '#b8860b',
          });
        } else {
          // Revert optimistic update on error
          setWishlist(prev => [...prev, productId]);
          throw new Error('Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await fetch('http://localhost:3001/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        });

        if (response.ok) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Added to wishlist! 💖',
            showConfirmButton: false,
            timer: 1200,
            timerProgressBar: true,
            background: '#fffbe6',
            color: '#3b2f2f',
            iconColor: '#b8860b',
          });
        } else {
          // Revert optimistic update on error
          setWishlist(prev => prev.filter(id => id !== productId));
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Wishlist Error',
        text: error.message || 'Failed to update wishlist',
        background: '#fffbe6',
        color: '#3b2f2f',
        iconColor: '#b8860b',
      });
    }
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // Add all wishlist items to cart
  const addAllWishlistToCart = () => {
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Please Sign In',
        text: 'You need to be signed in to use the wishlist feature.',
        showConfirmButton: true,
        confirmButtonText: 'Sign In',
        background: '#fffbe6',
        color: '#3b2f2f',
        iconColor: '#b8860b',
      });
      return;
    }

    const wishlistProducts = productsData.filter(p => isInWishlist(p._id));
    if (wishlistProducts.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Empty Wishlist',
        text: 'Your wishlist is empty. Add some items first!',
        background: '#fffbe6',
        color: '#3b2f2f',
        iconColor: '#b8860b',
      });
      return;
    }

    wishlistProducts.forEach(product => {
      addToCart(product);
    });
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Added ${wishlistProducts.length} item${wishlistProducts.length !== 1 ? 's' : ''} to cart! 🛒`,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: '#fffbe6',
      color: '#3b2f2f',
      iconColor: '#b8860b',
    });
  };

  // Get unique categories
  const categories = [
    CATEGORY_ALL, 
    CATEGORY_TOP_RATED, 
    ...Array.from(new Set(productsData.map(p => p.category))),
    ...(wishlist.length > 0 ? ['Wishlist'] : [])
  ];

  // Get all top-rated products across all categories (averageRating >= 4.5)
  const getAllTopRatedProducts = () => {
    return productsData.filter(p => (p.averageRating || 0) >= 4.5);
  };

  // Filtered and sorted products
  const getFilteredProducts = () => {
    let filtered = productsData;

    // Category filter
    if (selectedCategory === CATEGORY_ALL) {
      filtered = productsData; // Show ALL products
    } else if (selectedCategory === CATEGORY_TOP_RATED) {
      filtered = getAllTopRatedProducts(); // Show only top-rated products
    } else if (selectedCategory === 'Wishlist') {
      filtered = productsData.filter(p => isInWishlist(p._id)); // Show only wishlist items
    } else {
      filtered = productsData.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Calorie range filter
    filtered = filtered.filter(p => {
      const calories = p.calories || 0;
      return calories >= calorieRange[0] && calories <= calorieRange[1];
    });

    // Dietary filters
    if (dietaryFilters.vegetarian) {
      filtered = filtered.filter(p => {
        const allergyInfo = (p.allergyInfo || '').toLowerCase();
        return !allergyInfo.includes('meat') && !allergyInfo.includes('chicken') && !allergyInfo.includes('fish') && !allergyInfo.includes('pork') && !allergyInfo.includes('beef');
      });
    }

    if (dietaryFilters.vegan) {
      filtered = filtered.filter(p => {
        const allergyInfo = (p.allergyInfo || '').toLowerCase();
        return !allergyInfo.includes('milk') && !allergyInfo.includes('dairy') && !allergyInfo.includes('eggs') && !allergyInfo.includes('meat') && !allergyInfo.includes('chicken') && !allergyInfo.includes('fish');
      });
    }

    if (dietaryFilters.glutenFree) {
      filtered = filtered.filter(p => {
        const allergyInfo = (p.allergyInfo || '').toLowerCase();
        return !allergyInfo.includes('gluten') && !allergyInfo.includes('wheat');
      });
    }

    if (dietaryFilters.dairyFree) {
      filtered = filtered.filter(p => {
        const allergyInfo = (p.allergyInfo || '').toLowerCase();
        return !allergyInfo.includes('milk') && !allergyInfo.includes('dairy');
      });
    }

    if (dietaryFilters.nutFree) {
      filtered = filtered.filter(p => {
        const allergyInfo = (p.allergyInfo || '').toLowerCase();
        return !allergyInfo.includes('nuts') && !allergyInfo.includes('almond') && !allergyInfo.includes('walnut') && !allergyInfo.includes('peanut');
      });
    }

    // Allergy filters (exclude items with specific allergies)
    if (allergyFilters.milk) {
      filtered = filtered.filter(p => {
        const allergyInfo = (p.allergyInfo || '').toLowerCase();
        return !allergyInfo.includes('milk') && !allergyInfo.includes('dairy');
      });
    }

    if (allergyFilters.eggs) {
      filtered = filtered.filter(p => {
        const allergyInfo = (p.allergyInfo || '').toLowerCase();
        return !allergyInfo.includes('eggs');
      });
    }

    if (allergyFilters.nuts) {
      filtered = filtered.filter(p => {
        const allergyInfo = (p.allergyInfo || '').toLowerCase();
        return !allergyInfo.includes('nuts') && !allergyInfo.includes('almond') && !allergyInfo.includes('walnut') && !allergyInfo.includes('peanut');
      });
    }

    if (allergyFilters.gluten) {
      filtered = filtered.filter(p => {
        const allergyInfo = (p.allergyInfo || '').toLowerCase();
        return !allergyInfo.includes('gluten') && !allergyInfo.includes('wheat');
      });
    }

    if (allergyFilters.soy) {
      filtered = filtered.filter(p => {
        const allergyInfo = (p.allergyInfo || '').toLowerCase();
        return !allergyInfo.includes('soy');
      });
    }

    // Preparation time filter
    if (preparationTime === 'quick') {
      filtered = filtered.filter(p => p.preparationTime === 'quick');
    } else if (preparationTime === 'slow') {
      filtered = filtered.filter(p => p.preparationTime === 'slow');
    }
    // If preparationTime is 'all', no filtering is applied (shows all items including regular)

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'calories-low':
          return (a.calories || 0) - (b.calories || 0);
        case 'calories-high':
          return (b.calories || 0) - (a.calories || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // Group filtered products by category
  const grouped = filteredProducts.reduce((acc, product) => {
    acc[product.category] = acc[product.category] || [];
    acc[product.category].push(product);
    return acc;
  }, {});

  const styles = {
    menuSection: {
      backgroundColor: '#faf8f3',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '40px 24px',
      position: 'relative',
      zIndex: 2,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
      transition: 'all 0.8s ease-out',
    },
    header: {
          textAlign: 'center',
      marginBottom: '60px',
    },
    title: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: '800',
      color: '#5d4037',
      marginBottom: '16px',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
    },
    subtitle: {
      fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
      color: '#6d4c41',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6',
    },
    searchSection: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      padding: '32px',
      marginBottom: '40px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(184, 134, 11, 0.1)',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
        transform: 'translateY(-2px)',
      },
    },
    searchRow: {
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginBottom: '24px',
    },
    searchInput: {
      flex: '1',
      minWidth: '250px',
      padding: '16px 20px 16px 56px',
      border: '2px solid rgba(184, 134, 11, 0.2)',
      borderRadius: '12px',
      fontSize: '1rem',
      backgroundColor: '#fff',
      color: '#3b2f2f',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23b8860b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3ccircle cx='11' cy='11' r='8'%3e%3c/circle%3e%3cpath d='m21 21-4.35-4.35'%3e%3c/path%3e%3c/svg%3e\")",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'left 20px center',
      backgroundSize: '18px',
    },
    searchInputFocus: {
      borderColor: '#b8860b',
      boxShadow: '0 0 0 3px rgba(184, 134, 11, 0.1)',
    },
    filterSelect: {
      padding: '16px 20px',
      border: '2px solid rgba(184, 134, 11, 0.2)',
      borderRadius: '12px',
      fontSize: '1rem',
      backgroundColor: '#fff',
      color: '#3b2f2f',
      cursor: 'pointer',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontWeight: '500',
      minWidth: '180px',
      position: 'relative',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      '&:hover': {
        borderColor: '#b8860b',
        boxShadow: '0 4px 16px rgba(184, 134, 11, 0.15)',
        transform: 'translateY(-2px)',
      },
      '&:focus': {
        borderColor: '#b8860b',
        boxShadow: '0 0 0 3px rgba(184, 134, 11, 0.1)',
        transform: 'translateY(-2px)',
      },
    },
    categoryTabs: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      justifyContent: 'center',
      marginBottom: '40px',
    },
    categoryTab: {
      padding: '12px 24px',
      borderRadius: '25px',
      border: '2px solid rgba(184, 134, 11, 0.3)',
      backgroundColor: '#fff',
      color: '#6d4c41',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      fontSize: '0.95rem',
    },
    categoryTabActive: {
      backgroundColor: '#b8860b',
      color: '#fff',
      borderColor: '#b8860b',
      boxShadow: '0 4px 16px rgba(184, 134, 11, 0.3)',
    },
    productsGrid: {
          display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '32px',
      marginBottom: '40px',
    },
    productCard: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(184, 134, 11, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
              position: 'relative',
    },
    productCardHovered: {
      transform: 'translateY(-8px)',
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
    },
    productImage: {
      width: '100%',
      height: '240px',
      objectFit: 'cover',
      transition: 'all 0.3s ease',
    },
    productImageHovered: {
      transform: 'scale(1.05)',
    },
    productContent: {
      padding: '24px',
    },
    productBadge: {
                  position: 'absolute',
      top: '16px',
      right: '16px',
      backgroundColor: '#b8860b',
      color: '#fff',
      padding: '6px 12px',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: '700',
      zIndex: 2,
    },
    productTitle: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#3b2f2f',
      marginBottom: '8px',
      lineHeight: '1.3',
    },
    productDescription: {
      color: '#6d4c41',
      fontSize: '0.95rem',
      lineHeight: '1.5',
      marginBottom: '16px',
    },
    productRating: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
    },
    stars: {
      color: '#FFD700',
      fontSize: '1.1rem',
    },
    ratingText: {
      color: '#b8860b',
      fontWeight: '600',
      fontSize: '0.9rem',
    },
    productFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    productPrice: {
      fontSize: '1.4rem',
      fontWeight: '800',
      color: '#b8860b',
    },
    addButton: {
      backgroundColor: '#b8860b',
                  color: '#fff',
      border: 'none',
      borderRadius: '12px',
      padding: '12px 20px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    addButtonHovered: {
      backgroundColor: '#a67c0a',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(184, 134, 11, 0.4)',
    },
    wishlistButton: {
      position: 'absolute',
      top: '16px',
      left: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
      transition: 'all 0.3s ease',
      zIndex: 3,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    wishlistButtonHovered: {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      transform: 'scale(1.1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    wishlistButtonActive: {
      backgroundColor: '#ff6b6b',
      color: '#fff',
    },
    noProducts: {
      textAlign: 'center',
      padding: '80px 24px',
      color: '#6d4c41',
    },
    noProductsIcon: {
      fontSize: '4rem',
      marginBottom: '24px',
      opacity: '0.5',
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '80px 24px',
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: '4px solid rgba(184, 134, 11, 0.2)',
      borderTop: '4px solid #b8860b',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 24px',
    },
    decorativeElement: {
      position: 'absolute',
      top: '10%',
      left: '5%',
      width: '200px',
      height: '200px',
      background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 6s ease-in-out infinite',
    },
    decorativeElement2: {
      position: 'absolute',
      bottom: '20%',
      right: '10%',
      width: '250px',
      height: '250px',
      background: 'radial-gradient(circle, rgba(193, 154, 107, 0.08) 0%, rgba(193, 154, 107, 0.04) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 8s ease-in-out infinite reverse',
    },
    // Modal Styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeIn 0.3s ease-out',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      animation: 'slideIn 0.3s ease-out',
      position: 'relative',
    },
    modalClose: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: '#666',
      transition: 'all 0.3s ease',
      zIndex: 10,
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        transform: 'scale(1.1)',
        color: '#333',
      },
    },
    modalBody: {
      display: 'flex',
      flexDirection: 'column',
    },
    modalImage: {
      width: '100%',
      height: '300px',
      objectFit: 'cover',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'scale(1.05)',
      },
    },
    modalInfo: {
      padding: '32px',
    },
    modalTitle: {
      fontSize: '2rem',
      fontWeight: '800',
      color: '#3b2f2f',
      marginBottom: '16px',
      lineHeight: '1.2',
    },
    modalDescription: {
      color: '#6d4c41',
      fontSize: '1.1rem',
      lineHeight: '1.6',
      marginBottom: '24px',
    },
    modalMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    modalPrice: {
      fontSize: '2rem',
      fontWeight: '800',
      color: '#b8860b',
    },
    modalCalories: {
      backgroundColor: '#f0f0f0',
      color: '#666',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: '600',
    },
    modalRating: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
    },
    modalAllergyInfo: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid #ffeaa7',
    },
    modalPrepTime: {
      backgroundColor: '#d1ecf1',
      color: '#0c5460',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '24px',
      border: '1px solid #bee5eb',
    },
    modalActions: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
    },
    modalAddToCart: {
      backgroundColor: '#b8860b',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      padding: '16px 32px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      flex: '1',
      minWidth: '200px',
      '&:hover': {
        backgroundColor: '#a67c0a',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(184, 134, 11, 0.4)',
      },
    },
    productInfo: {
      padding: '24px',
    },
    productMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    },
    productCalories: {
      backgroundColor: '#f0f0f0',
      color: '#666',
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '0.8rem',
      fontWeight: '600',
    },
    addToCartButton: {
      backgroundColor: '#b8860b',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      padding: '12px 20px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginTop: '0',
      '&:hover': {
        backgroundColor: '#a67c0a',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(184, 134, 11, 0.3)',
      },
    },
  };

  // Add CSS animations
  const animationStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(30px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeInScale {
      0% { opacity: 0; transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    @keyframes slideIn {
      0% { opacity: 0; transform: translateY(-50px) scale(0.9); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    /* Search input placeholder styling */
    input::placeholder {
      color: #888 !important;
      opacity: 1;
    }
    
    /* Select option styling */
    select option {
      background-color: #fff;
      color: #3b2f2f;
    }
    
    /* Enhanced search section styling */
    .search-section {
      background-color: #fff;
      border-radius: 20px;
      padding: 32px;
      margin-bottom: 40px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(184, 134, 11, 0.1);
      transition: all 0.3s ease;
      animation: fadeInScale 0.6s ease-out;
    }
    
    .search-section:hover {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }
    
    /* Enhanced search input styling */
    .search-input {
      flex: 1;
      min-width: 250px;
      padding: 16px 20px 16px 56px;
      border: 2px solid rgba(184, 134, 11, 0.2);
      border-radius: 12px;
      font-size: 1rem;
      background-color: #fff;
      color: #3b2f2f;
      transition: all 0.3s ease;
      outline: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23b8860b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3ccircle cx='11' cy='11' r='8'%3e%3c/circle%3e%3cpath d='m21 21-4.35-4.35'%3e%3c/path%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: left 20px center;
      background-size: 18px;
      text-indent: 0;
    }
    
    .search-input:hover {
      border-color: #b8860b;
      box-shadow: 0 4px 16px rgba(184, 134, 11, 0.15);
      transform: translateY(-2px);
    }
    
    .search-input:focus {
      border-color: #b8860b;
      box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.1);
      transform: translateY(-2px);
    }
    
    /* Enhanced filter select styling */
    .filter-select {
      padding: 16px 20px;
      border: 2px solid rgba(184, 134, 11, 0.2);
      border-radius: 12px;
      font-size: 1rem;
      background-color: #fff;
      color: #3b2f2f;
      cursor: pointer;
      outline: none;
      transition: all 0.3s ease;
      font-weight: 500;
      min-width: 180px;
      position: relative;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .filter-select:hover {
      border-color: #b8860b;
      box-shadow: 0 4px 16px rgba(184, 134, 11, 0.15);
      transform: translateY(-2px);
    }
    
    .filter-select:focus {
      border-color: #b8860b;
      box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.1);
      transform: translateY(-2px);
    }
    
    /* Custom dropdown arrow */
    .filter-select {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23b8860b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 16px;
      padding-right: 40px;
    }
    
    /* Wishlist section styling */
    .wishlist-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      padding: 16px 20px;
      background-color: rgba(184, 134, 11, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(184, 134, 11, 0.1);
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(184, 134, 11, 0.08);
      animation: fadeInScale 0.6s ease-out;
    }
    
    .wishlist-section:hover {
      box-shadow: 0 4px 16px rgba(184, 134, 11, 0.12);
      transform: translateY(-1px);
    }
    
    .wishlist-button {
      transition: all 0.3s ease;
    }
    
    .wishlist-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(184, 134, 11, 0.2);
    }
    
    .wishlist-button.primary:hover {
      background-color: #ff5252 !important;
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3) !important;
    }
    
    .wishlist-button.secondary:hover {
      background-color: rgba(184, 134, 11, 0.1) !important;
      box-shadow: 0 4px 12px rgba(184, 134, 11, 0.2) !important;
    }
    
    .wishlist-button.success:hover {
      background-color: #218838 !important;
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3) !important;
    }
    
    /* Range slider styling */
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      border-radius: 3px;
      outline: none;
      cursor: pointer;
    }
    
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #b8860b;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(184, 134, 11, 0.3);
      transition: all 0.3s ease;
    }
    
    input[type="range"]::-webkit-slider-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(184, 134, 11, 0.4);
    }
    
    input[type="range"]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #b8860b;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 6px rgba(184, 134, 11, 0.3);
      transition: all 0.3s ease;
    }
    
    input[type="range"]::-moz-range-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(184, 134, 11, 0.4);
    }
    
    /* Filter button styling */
    .filter-button {
      transition: all 0.3s ease;
      border-radius: 20px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      border: 2px solid;
    }
    
    .filter-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .filter-button.dietary {
      border-color: #b8860b;
      color: #b8860b;
      background-color: transparent;
    }
    
    .filter-button.dietary.active {
      background-color: #b8860b;
      color: #fff;
    }
    
    .filter-button.allergy {
      border-color: #ff6b6b;
      color: #ff6b6b;
      background-color: transparent;
    }
    
    .filter-button.allergy.active {
      background-color: #ff6b6b;
      color: #fff;
    }
    
    .filter-button.time {
      border-color: #b8860b;
      color: #b8860b;
      background-color: transparent;
    }
    
    .filter-button.time.active {
      background-color: #b8860b;
      color: #fff;
    }
  `;

  const renderProductCard = (product) => (
    <div
      key={product._id || product.id}
      style={{
        ...styles.productCard,
        ...(hoveredCard === product._id ? styles.productCardHovered : {})
      }}
      onMouseEnter={() => setHoveredCard(product._id)}
      onMouseLeave={() => setHoveredCard(null)}
      onClick={() => {
        setModalProduct(product);
        setModalQuantity(1); // Reset quantity when opening modal
      }}
    >
      {/* Wishlist Button */}
      <button
        style={{
          ...styles.wishlistButton,
          ...(hoveredCard === product._id ? styles.wishlistButtonHovered : {}),
          ...(isInWishlist(product._id) ? styles.wishlistButtonActive : {})
        }}
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product._id);
        }}
        title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isInWishlist(product._id) ? '❤️' : '🤍'}
      </button>

      {product.badge && (
        <span style={styles.productBadge}>{product.badge}</span>
      )}
      <img 
        src={`http://localhost:3001/images/${product.image}`}
        alt={product.name}
        style={styles.productImage}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
        }}
      />
      <div style={styles.productInfo}>
        <h3 style={styles.productTitle}>{product.name}</h3>
        <p style={styles.productDescription}>{product.description}</p>
        <div style={styles.productMeta}>
          <span style={styles.productPrice}>₹{product.price}</span>
          {product.calories && (
            <span style={styles.productCalories}>{product.calories} kcal</span>
          )}
        </div>
        <div style={styles.productRating}>
          <span style={styles.stars}>
            {'★'.repeat(Math.floor(product.averageRating || product.rating || 0))}
            {'☆'.repeat(5 - Math.floor(product.averageRating || product.rating || 0))}
          </span>
          <span style={styles.ratingText}>
            {product.averageRating || product.rating || 0} ({product.reviewCount || 0} reviews)
          </span>
        </div>
        <div style={{
          display: 'flex',
          marginTop: '16px',
        }}>
          <button
            style={{
              ...styles.addToCartButton,
              width: '100%',
              backgroundColor: '#b8860b',
              padding: '14px 24px',
              fontSize: '1rem',
              fontWeight: '700',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 16px rgba(184, 134, 11, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#a67c0a';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(184, 134, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#b8860b';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(184, 134, 11, 0.2)';
            }}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Added to cart! 🛒',
                showConfirmButton: false,
                timer: 1200,
                timerProgressBar: true,
                background: '#fffbe6',
                color: '#3b2f2f',
                iconColor: '#b8860b',
              });
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!modalProduct) return null;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalProduct(null);
        setModalQuantity(1);
      }
    };

    const closeModal = () => {
      setModalProduct(null);
      setModalQuantity(1);
    };

    return (
      <div 
        style={styles.modalOverlay} 
        onClick={closeModal}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >

        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <button style={styles.modalClose} onClick={closeModal}>
            ×
          </button>
          <div style={styles.modalBody}>
            <img 
              src={`http://localhost:3001/images/${modalProduct.image}`}
              alt={modalProduct.name}
              style={styles.modalImage}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
              }}
            />
            <div style={styles.modalInfo}>
              <h2 style={styles.modalTitle}>{modalProduct.name}</h2>
              <p style={styles.modalDescription}>{modalProduct.description}</p>
              <div style={styles.modalMeta}>
                <span style={styles.modalPrice}>₹{modalProduct.price}</span>
                {modalProduct.calories && (
                  <span style={styles.modalCalories}>{modalProduct.calories} kcal</span>
                )}
              </div>
              <div style={styles.modalRating}>
                <span style={styles.stars}>
                  {'★'.repeat(Math.floor(modalProduct.averageRating || modalProduct.rating || 0))}
                  {'☆'.repeat(5 - Math.floor(modalProduct.averageRating || modalProduct.rating || 0))}
                </span>
                <span style={styles.ratingText}>
                  {modalProduct.averageRating || modalProduct.rating || 0} ({modalProduct.reviewCount || 0} reviews)
                </span>
              </div>
              {modalProduct.allergyInfo && (
                <div style={styles.modalAllergyInfo}>
                  <strong>Allergy Info:</strong> {modalProduct.allergyInfo}
                </div>
              )}
              {modalProduct.preparationTime && (
                <div style={styles.modalPrepTime}>
                  <strong>Preparation Time:</strong> {modalProduct.preparationTime.charAt(0).toUpperCase() + modalProduct.preparationTime.slice(1)}
                </div>
              )}
              
              {/* Quantity Selector */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
              }}>
                <label style={{
                  color: '#3b2f2f',
                  fontWeight: '600',
                  fontSize: '1rem',
                }}>
                  Quantity:
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <button
                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                    style={{
                      backgroundColor: '#e9ecef',
                      color: '#495057',
                      border: 'none',
                      borderRadius: '8px',
                      width: '36px',
                      height: '36px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dee2e6';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#e9ecef';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    -
                  </button>
                  <span style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#3b2f2f',
                    minWidth: '40px',
                    textAlign: 'center',
                  }}>
                    {modalQuantity}
                  </span>
                  <button
                    onClick={() => setModalQuantity(modalQuantity + 1)}
                    style={{
                      backgroundColor: '#e9ecef',
                      color: '#495057',
                      border: 'none',
                      borderRadius: '8px',
                      width: '36px',
                      height: '36px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dee2e6';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#e9ecef';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    +
                  </button>
                </div>
                <div style={{
                  marginLeft: 'auto',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#b8860b',
                }}>
                  Total: ₹{(modalProduct.price * modalQuantity).toFixed(2)}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                marginTop: '24px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '2px solid #e9ecef',
              }}>
                <h3 style={{
                  width: '100%',
                  textAlign: 'center',
                  marginBottom: '16px',
                  color: '#3b2f2f',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                }}>
                  Choose Your Action
                </h3>
                {/* Add to Cart Button */}
                <button
                  style={{
                    backgroundColor: '#b8860b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    flex: '1',
                    minWidth: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 3px 12px rgba(184, 134, 11, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#a67c0a';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 24px rgba(184, 134, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#b8860b';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 16px rgba(184, 134, 11, 0.2)';
                  }}
                  onClick={() => {
                    // Add the product with the selected quantity
                    for (let i = 0; i < modalQuantity; i++) {
                      addToCart(modalProduct);
                    }
                    setModalProduct(null);
                    setModalQuantity(1);
                    
                    // Show success message
                    Swal.fire({
                      toast: true,
                      position: 'top-end',
                      icon: 'success',
                      title: `Added ${modalQuantity} ${modalQuantity === 1 ? 'item' : 'items'} to cart! 🛒`,
                      showConfirmButton: false,
                      timer: 2000,
                      timerProgressBar: true,
                      background: '#fffbe6',
                      color: '#3b2f2f',
                      iconColor: '#b8860b',
                    });
                  }}
                >
                  Add to Cart
                </button>
                
                {/* Add to Wishlist Button */}
                <button
                  style={{
                    backgroundColor: isInWishlist(modalProduct._id) ? '#ff6b6b' : '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    flex: '1',
                    minWidth: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: isInWishlist(modalProduct._id) 
                      ? '0 3px 12px rgba(255, 107, 107, 0.2)' 
                      : '0 3px 12px rgba(108, 117, 125, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    if (isInWishlist(modalProduct._id)) {
                      e.target.style.backgroundColor = '#ff5252';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 107, 0.4)';
                    } else {
                      e.target.style.backgroundColor = '#5a6268';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 24px rgba(108, 117, 125, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isInWishlist(modalProduct._id)) {
                      e.target.style.backgroundColor = '#ff6b6b';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 16px rgba(255, 107, 107, 0.2)';
                    } else {
                      e.target.style.backgroundColor = '#6c757d';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 16px rgba(108, 117, 125, 0.2)';
                    }
                  }}
                  onClick={() => {
                    toggleWishlist(modalProduct._id);
                  }}
                >
                  {isInWishlist(modalProduct._id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <section id="menu-section" style={styles.menuSection}>
        <style>{animationStyles}</style>
        
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Our Menu</h1>
            <p style={styles.subtitle}>
              Discover our carefully curated selection of delicious coffee, pastries, and more
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="search-section" style={styles.searchSection}>
            <div style={styles.searchRow}>
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={styles.searchInput}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
                style={styles.filterSelect}
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Sort by Rating</option>
                <option value="calories-low">Calories: Low to High</option>
                <option value="calories-high">Calories: High to Low</option>
              </select>
              
              {/* Advanced Filters Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  backgroundColor: showFilters ? '#b8860b' : 'transparent',
                  color: showFilters ? '#fff' : '#b8860b',
                  border: `2px solid #b8860b`,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  minWidth: '120px',
                }}
              >
                {showFilters ? 'Hide Filters' : 'Advanced Filters'}
              </button>
            </div>
            
            {/* Advanced Filters Section */}
            {showFilters && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: 'rgba(184, 134, 11, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(184, 134, 11, 0.1)',
              }}>
                <h3 style={{ 
                  color: '#3b2f2f', 
                  marginBottom: '16px',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  Advanced Filters
                </h3>
                
                {/* Price Range */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: '#3b2f2f', 
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: 'linear-gradient(to right, #b8860b, #d6a96d)',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Calorie Range */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: '#3b2f2f', 
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Calorie Range: {calorieRange[0]} - {calorieRange[1]} kcal
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={calorieRange[1]}
                    onChange={(e) => setCalorieRange([calorieRange[0], parseInt(e.target.value)])}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: 'linear-gradient(to right, #28a745, #5cb85c)',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Dietary Filters */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: '#3b2f2f', 
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Dietary Preferences
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(dietaryFilters).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setDietaryFilters(prev => ({ ...prev, [key]: !value }))}
                        style={{
                          backgroundColor: value ? '#b8860b' : 'transparent',
                          color: value ? '#fff' : '#b8860b',
                          border: `2px solid #b8860b`,
                          borderRadius: '20px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allergy Filters */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: '#3b2f2f', 
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Exclude Allergies
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(allergyFilters).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setAllergyFilters(prev => ({ ...prev, [key]: !value }))}
                        style={{
                          backgroundColor: value ? '#ff6b6b' : 'transparent',
                          color: value ? '#fff' : '#ff6b6b',
                          border: `2px solid #ff6b6b`,
                          borderRadius: '20px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preparation Time */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: '#3b2f2f', 
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Preparation Time
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['all', 'quick', 'slow'].map((time) => (
                      <button
                        key={time}
                        onClick={() => setPreparationTime(time)}
                        style={{
                          backgroundColor: preparationTime === time ? '#b8860b' : 'transparent',
                          color: preparationTime === time ? '#fff' : '#b8860b',
                          border: `2px solid #b8860b`,
                          borderRadius: '20px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {time === 'all' ? 'All' : time === 'quick' ? 'Quick (< 5 min)' : 'Slow (> 15 min)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={() => {
                    setDietaryFilters({
                      vegetarian: false,
                      vegan: false,
                      glutenFree: false,
                      dairyFree: false,
                      nutFree: false
                    });
                    setAllergyFilters({
                      milk: false,
                      eggs: false,
                      nuts: false,
                      gluten: false,
                      soy: false
                    });
                    setCalorieRange([0, 1000]);
                    setPriceRange([0, 1000]);
                    setPreparationTime('all');
                  }}
                  style={{
                    backgroundColor: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
          
          {/* Wishlist Section - Redesigned */}
          {token && (
            <div className="wishlist-section">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#ff6b6b',
                  borderRadius: '50%',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                }}>
                  💖
                </div>
                <div>
                  <div style={{ 
                    color: '#3b2f2f', 
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    marginBottom: '2px'
                  }}>
                    My Wishlist
                  </div>
                  <div style={{ 
                    color: '#b8860b', 
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    {wishlistLoading ? 'Loading...' : `${wishlist.length} item${wishlist.length !== 1 ? 's' : ''} saved`}
                  </div>
                </div>
              </div>
              
              {wishlist.length > 0 && !wishlistLoading && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      if (selectedCategory === 'Wishlist') {
                        setSelectedCategory(CATEGORY_ALL);
                      } else {
                        setSelectedCategory('Wishlist');
                      }
                    }}
                    className={`wishlist-button ${selectedCategory === 'Wishlist' ? 'primary' : 'secondary'}`}
                    style={{
                      backgroundColor: selectedCategory === 'Wishlist' ? '#ff6b6b' : 'transparent',
                      color: selectedCategory === 'Wishlist' ? '#fff' : '#b8860b',
                      border: `2px solid ${selectedCategory === 'Wishlist' ? '#ff6b6b' : '#b8860b'}`,
                      borderRadius: '8px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      minWidth: '100px',
                    }}
                  >
                    {selectedCategory === 'Wishlist' ? 'Show All' : 'View Wishlist'}
                  </button>
                  
                  <button
                    onClick={addAllWishlistToCart}
                    className="wishlist-button success"
                    style={{
                      backgroundColor: '#28a745',
                      color: '#fff',
                      border: '2px solid #28a745',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      minWidth: '120px',
                    }}
                  >
                    Add All to Cart
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Counter */}
          {!loading && filteredProducts.length > 0 && (
            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
              padding: '12px 20px',
              backgroundColor: 'rgba(184, 134, 11, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(184, 134, 11, 0.2)',
            }}>
              <span style={{
                color: '#3b2f2f',
                fontWeight: '600',
                fontSize: '1rem',
              }}>
                Showing {filteredProducts.length} of {productsData.length} products
              </span>
              {(searchTerm || showFilters) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDietaryFilters({
                      vegetarian: false,
                      vegan: false,
                      glutenFree: false,
                      dairyFree: false,
                      nutFree: false
                    });
                    setAllergyFilters({
                      milk: false,
                      eggs: false,
                      nuts: false,
                      gluten: false,
                      soy: false
                    });
                    setCalorieRange([0, 1000]);
                    setPriceRange([0, 1000]);
                    setPreparationTime('all');
                    setShowFilters(false);
                  }}
                  style={{
                    marginLeft: '12px',
                    backgroundColor: 'transparent',
                    color: '#b8860b',
                    border: '1px solid #b8860b',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
          )}

          {/* Category Tabs */}
          <div style={styles.categoryTabs}>
            {categories.map(category => (
              <button
                key={category}
                style={{
                  ...styles.categoryTab,
                  ...(selectedCategory === category ? styles.categoryTabActive : {})
                }}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <div style={{ color: '#b8860b', fontSize: '1.2rem', fontWeight: '600' }}>
                Loading our delicious menu...
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={styles.noProducts}>
              <div style={styles.noProductsIcon}>☕</div>
              <h3 style={{ color: '#6d4c41', marginBottom: '12px' }}>
                No products found
              </h3>
              <p style={{ color: '#888' }}>
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div style={styles.productsGrid}>
              {filteredProducts.map(renderProductCard)}
            </div>
          )}
        </div>
      </section>
      {renderModal()}
    </>
  );
};

export default Menu;