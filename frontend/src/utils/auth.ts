export const handleAuthError = (status: number, router: any) => {
  if (status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }
};