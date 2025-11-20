export const isUserLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check localStorage for user or studio data
    const userData = localStorage.getItem('user');
    const studioData = localStorage.getItem('studio');
    
    if (userData && userData.trim() !== '') {
      const parsed = JSON.parse(userData);
      return !!(parsed && parsed.id && parsed.email);
    }
    
    if (studioData && studioData.trim() !== '') {
      const parsed = JSON.parse(studioData);
      return !!(parsed && (parsed._id || parsed.id) && parsed.email);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking login status:', error);
    // Clear corrupted data
    localStorage.removeItem('user');
    localStorage.removeItem('studio');
    return false;
  }
};

export const getUserData = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    const studioData = localStorage.getItem('studio');
    
    if (userData && userData.trim() !== '') {
      return JSON.parse(userData);
    }
    
    if (studioData && studioData.trim() !== '') {
      const parsed = JSON.parse(studioData);
      return {
        id: parsed._id || parsed.id,
        fullName: parsed.name || parsed.username || parsed.photographerName,
        email: parsed.email,
        phone: parsed.mobile || parsed.phone || '',
        isVerified: true
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    // Clear corrupted data
    localStorage.removeItem('user');
    localStorage.removeItem('studio');
    return null;
  }
};

export const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('user');
  localStorage.removeItem('studio');
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};