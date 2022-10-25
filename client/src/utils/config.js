const attribution =
    "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors";
const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

/**
 * Class that is used to access the initial configuration parameters 
 * to see up the map.
 */
class Config {
  constructor() {
    this.attribution = attribution;
    this.tileUrl = tileUrl;
    this.mapCenter = ["45.50923415869288", "-73.66470336914062"];
    this.bounds = [
      ["45.260388684823695", "-74.22775268554688"],
      ["45.744526980468436", "-73.3392333984375"]
    ]
    this.minZoom = 4,
    this.maxZoom = 18,
    this.initialZoom = 12
  }
}

export default Config;