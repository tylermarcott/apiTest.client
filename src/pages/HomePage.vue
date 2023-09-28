<template>
  <section>
    <div class="row">
      <button @click="spotifyConnect()" class="btn btn-dark">button</button>
    </div>
        <div class="row">
        <button @click="getSong()" class="btn btn-danger">get song</button>
      </div>
      <div>
        <button class="btn btn-warning" @click="requestToken()">get single token</button>
      </div>
        <div>
          <button class="btn btn-primary" @click="refreshAccessToken()">refresh token</button>
        </div>
        <div>
          <button @click="togglePlay" class="btn btn-success"><i class="mdi mdi-play"></i></button>
        </div>

    <div>
      <h1>Spotify Web Playback SDK Quick Start</h1>
    </div>

  </section>
</template>

<script>
import { apiService } from "../services/ApiService.js";
import { logger } from "../utils/Logger.js";
import Pop from "../utils/Pop.js";
import { onMounted, ref } from "vue";
import { clientId, redirectUri } from "../env.js";



export default {
  setup() {

    const player = ref(null)

    async function StartPlayer(){
      await requestToken()

      const script = await document.createElement('script');
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.addEventListener('load', ()=>{
      })
      window.onSpotifyWebPlaybackSDKReady = () => {
        logger.log('SPOTIFY WEB PLAYBACK READY')
        registerWebPlayback()
      }
      // script.onerror(err=> logger.error(err))
      document.body.appendChild(script)
    }
    
    async function registerWebPlayback(){
      logger.log('registering')
      const token = localStorage.getItem('access_token');
      // eslint-disable-next-line no-undef
      player.value = new Spotify.Player({
          name: 'Web Playback SDK Quick Start Player',
          getOAuthToken: cb => { cb(token); },
          volume: 0.5
        })
      initializeListeners()
        // Ready
      }
      
  async function initializeListeners(){
    try {

      player.value.setName("Mick is da Bomb")
      
       player.value.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
      });
      
      // Not Ready
       player.value.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });
      
      await player.value.connect()
      logger.log('connected')
    } catch (error) {
      logger.error(error)
    }

  }

    

    async function getToken(){
      try {
        await apiService.getToken()
      } catch (error) {
        Pop.error(error)
      }
    }

      // onMounted(()=> getSong())
    async function getSong(){
        try {
          await StartPlayer()
          await apiService.getSong()
        } catch (error) {
          Pop.error(error)
        }
    }

    function togglePlay(){
      try {
        player.value.togglePlay().then(() => {
          logger.log('Toggled playback!');
        });

        player.value.getCurrentState().then(state => {
          if (!state) {
            logger.error('User is not playing music through the Web Playback SDK');
            return;
          }

          var current_track = state.track_window.current_track;
          var next_track = state.track_window.next_tracks[0];

          logger.log('Currently Playing', current_track);
          logger.log('Playing Next', next_track);
        });


      } catch (error) {
        logger.error(error)
      }
    }

    function generateRandomString(length) {
      let text = '';
      let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (let i = 0; i <length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }


    let codeVerifier = generateRandomString(128);

    function spotifyConnect() {
      // ----------------------------------
    

      async function generateCodeChallenge(codeVerifier) {
        function base64encode(string) {
          return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);


        const digest = await window.crypto.subtle.digest('SHA-256', data);

        return base64encode(digest);
      }

  

      generateCodeChallenge(codeVerifier).then(codeChallenge => {
        let state = generateRandomString(16);
        // NOTE NEED TO ADD SCOPES WHEN ADDING FUNCTIONALITY
        let scope = 'user-read-private user-read-email user-modify-playback-state user-read-playback-state streaming app-remote-control';
        logger.log(codeVerifier)
        localStorage.setItem('code_verifier', codeVerifier);

        let args = new URLSearchParams({
          response_type: 'code',
          client_id: clientId,
          scope: scope,
          redirect_uri: redirectUri,
          state: state,
          code_challenge_method: 'S256',
          code_challenge: codeChallenge
        });

        window.location = 'https://accounts.spotify.com/authorize?' + args;
      });

      

      





      // --------------------------------------------------


      // SECTION: logging in/ requesting access to spotify account



      // ------------------------------------------------------------------------------------

      // SECTION: request an access token


      // ------------------------------------------------------------------------------------

    }

  async function requestToken() {
  const urlParams = new URLSearchParams(window.location.search);
      let code = urlParams.get('code');

      let codeVerifier = localStorage.getItem('code_verifier');

      let body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier
      });
    
      
      const response = fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('HTTP status ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
        })
        .catch(error => {
          logger.error('Error:', error);
        });

        
      logger.log('we got our access token!:', localStorage.getItem('access_token')
)

        async function getProfile(accessToken) {
        accessToken = localStorage.getItem('access_token');

        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: 'Bearer ' + accessToken
          }
        });

        logger.log('we got our access token!:', accessToken)

        const data = await response.json();
      }


      // await registerWebPlayback()

  }


  function refreshAccessToken(){
      const refreshToken = localStorage.getItem('refresh_token');
      logger.log('here is our refresh token:', refreshToken)
      const spotifyTokenUrl = 'https://accounts.spotify.com/api/token'
      const clientId = 'f60d41d8f71b48e59709254f06a045e8'

      let formData = new FormData();
      formData.append('grant_type', 'refresh_token');
      formData.append('refresh_token', refreshToken);
      formData.append('client_id', clientId)

      return fetch (spotifyTokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData).toString()
      })

      .then(response => response.json()
      .then(data=> {
        if(data && data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
        } else{
          throw new Error('No access token found')
        }
      }))
  }

  return {
    spotifyConnect,
    getSong,
    getToken,
    requestToken,
    refreshAccessToken,
    togglePlay,
    
  };
},};




</script>

<style scoped lang="scss">
.home {
  display: grid;
  height: 80vh;
  place-content: center;
  text-align: center;
  user-select: none;

  .home-card {
    width: 50vw;

    >img {
      height: 200px;
      max-width: 200px;
      width: 100%;
      object-fit: contain;
      object-position: center;
    }
  }
}
</style>
