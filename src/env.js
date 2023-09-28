export const dev = window.location.origin.includes('localhost')
export const baseURL = dev ? 'http://localhost:3000' : ''
export const useSockets = false
export const domain = 'http://dev-r2l4kl7ifqatct23.us.auth0.com/'
export const clientId = 'f60d41d8f71b48e59709254f06a045e8'
export const clientSecret = '97713bc189ab46e391d7813b31de6f8e'
export const audience = 'https://tylerapi.com/'

export const redirectUri = 'http://localhost:8080'