import HortonMap from "./HortonMap";
import Config from "../utils/config";
const config = new Config();
import { Component } from "react";


class HortonMapApp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      center: config.mapCenter,
      zoom: config.initialZoom,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
      bounds: config.bounds,
      url: config.tileUrl,
      attribution: config.attribution
    }
    this.boundsHandler = this.boundsHandler.bind(this);
  }

  /**
   * Callback function to update the bounds in the state
   * @param newBounds 
   */
  boundsHandler(newBounds) {
    this.setState({
      bounds: [
        [newBounds.getNorthEast().lat, newBounds.getNorthEast().lng],
        [newBounds.getSouthWest().lat, newBounds.getSouthWest().lng]
      ]
    });
  }

  render() {
    return (
      <HortonMap
        center={this.state.center}
        zoom={this.state.zoom}
        minZoom={this.state.minZoom}
        maxZoom={this.state.maxZoom}
        url={this.state.url}
        attribution={this.state.attribution}
        bounds={this.state.bounds}
        boundsHandler={this.boundsHandler}
      />
    );
  }
}

export default HortonMapApp;