import { useAuthContext } from '../context/AuthContext';

/**
 * Simplified hook for accessing auth
 * Re-exports the context hook with a shorter name
 */
export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;