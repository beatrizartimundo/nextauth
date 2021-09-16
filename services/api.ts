import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'
import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from '../error/AuthTokenError';


let isRefreshing = false;
let failedRequestQueue = [];

export function setupAPIClient(ctx = undefined) {

  let cookies = parseCookies(ctx)

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`
    }
  })

  api.interceptors.response.use(response => {
    //sucesso
    return response
  },
    //erro
    (error: AxiosError) => {
      if (error.response.status === 401) {
        if (error.response.data?.code === 'token.expired') {
          //renova o token com cookies
          cookies = parseCookies(ctx)

          const { 'nextauth.refreshToken': refreshToken } = cookies

          const originalConfig = error.config

          if (!isRefreshing) {

            isRefreshing = true;


            api.post('/refresh', {
              refreshToken,
            }).then(response => {
              const { token } = response.data

              setCookie(ctx, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30dias
                path: '/'
              })

              setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30dias
                path: '/'
              })

              api.defaults.headers['Authorization'] = `Bearer ${token}`

              failedRequestQueue.forEach(request => request.onSucess(token))
              failedRequestQueue = [];
              
            }).catch((err) => {
              failedRequestQueue.forEach(request => request.onFailure(err))
              failedRequestQueue = [];
              
              if (process.browser) {
                signOut();
              }

            }).finally(() => {
              isRefreshing = false;
            })
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              // refresh token sucesso
              onSuccess: (token: string) => {
                originalConfig.headers['Authorization'] = `Bearer ${token}`

                resolve(api(originalConfig))
              },
              // refresh token erro
              onFailure: (err: AxiosError) => {
                reject(err);
              }
            })
          });
        } else {
          // logout usuário
          if (process.browser) {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError())
          }
        }
      }

      return Promise.reject(error)
    });

  return api;
};