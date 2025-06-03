export const USERNAME_KEY = 'tpotracer_username';

/**
 * Get username from local storage
 * @returns Username or null if not found
 */
export const getUsername = (): string | null => {
  return localStorage.getItem(USERNAME_KEY);
};

/**
 * Set username in local storage
 * @param username Username to store
 */
export const setUsername = (username: string | null): void => {
  if (!username || username === '') {
    localStorage.removeItem(USERNAME_KEY);
  } else {
    localStorage.setItem(USERNAME_KEY, username);
  }
};