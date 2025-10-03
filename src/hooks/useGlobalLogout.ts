import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook để detect logout từ tab khác và redirect về login page
 * Sử dụng localStorage events để sync giữa các tabs
 */
export const useGlobalLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Function để check khi localStorage thay đổi
    const handleStorageChange = (e: StorageEvent) => {
      // Nếu token bị remove từ tab khác
      if (e.key === 'token' && e.newValue === null) {
        console.log('🚪 Detected logout from another tab, redirecting to login...');
        navigate('/login');
      }
      
      // Hoặc nếu có event logout custom
      if (e.key === 'logout-event') {
        console.log('🚪 Received logout event from another tab');
        localStorage.removeItem('logout-event'); // Clean up
        navigate('/login');
      }
    };

    // Lắng nghe storage events (chỉ trigger khi change từ tab khác)
    window.addEventListener('storage', handleStorageChange);

    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  // Function để trigger logout cho tất cả tabs
  const triggerGlobalLogout = () => {
    // Remove tokens
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Trigger event cho các tabs khác
    localStorage.setItem('logout-event', Date.now().toString());
    
    // Navigate current tab
    navigate('/login');
  };

  return { triggerGlobalLogout };
};
