import { clientId, clientSecret } from "../env.js"
import { logger } from "../utils/Logger.js"
import { loadState } from "../utils/Store.js"

import { api } from "./AxiosService.js"


class ApiService{


  
  async getSong(){
    const bearerToken = localStorage.getItem('access_token')
    logger.log('bear token', bearerToken)
    const res = await api.get("https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl", { headers: { Authorization: `Bearer ${bearerToken}` } })
    logger.log('here is our track:', res.data)
    // this.playSong()
    this.getDevice()
  }

  async getDevice(){
    const bearerToken = localStorage.getItem('access_token')
    const res = await api.get("https://api.spotify.com/v1/me/player/devices", { headers: { Authorization: `Bearer ${bearerToken}` } })
    logger.log('here is the list of devices pulled from the api:', res.data)
    // localStorage.setItem('device', res.data.devices[1].id)
    // this.playSong()
  }
  

playSong() {
  const token = localStorage.getItem('access_token');
  logger.log(token)
  const contextUri = 'spotify:album:5ht7ItJgpBH7W6vJ5BqpPr';
  const offsetPosition = 5;
  const positionMs = 0;
  // const device = localStorage.getItem('device')
  const url = `https://api.spotify.com/v1/me/player/play`;    //?device_id=${device}

  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const body = JSON.stringify({
    context_uri: contextUri,
    offset: {
      position: offsetPosition
    },
    position_ms: positionMs,
    // active_device: device
  });

  fetch(url, {
    method: 'PUT',
    headers: headers,
    body: body
  }).then(response => {
    if (response.ok) {
      logger.log('Song played successfully.');
    } else {
      logger.log('Error playing the song.');
      return response.json();
    }
  }).then(data => {
    if (data) {
      logger.log(data); // Log any error message returned by Spotify API
    }
  }).catch(error => {
    logger.error('There was an error:', error);
  });
}

  }



export const apiService = new ApiService()