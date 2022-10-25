import  { Component } from "react";
import HortonTooltip from "./HortonTooltip";
import MapMove from "./MapMove";
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Popup
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";


class HortonMap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hortons: [],
      activeHortons: null,
    }
    this.fetchTimHortons = this.fetchTimHortons.bind(this);
  }

  async componentDidMount() {
    await this.fetchTimHortons();
  }

  /**
   * Fetches the Tim Hortons that are within the bounds
   * and sets the state to the Tim Hortons that were fetched
   */
  async fetchTimHortons() {

    // extract the coordinates in the bounds for the query
    let coordinates = {
      neLat: this.props.bounds[0][0],
      neLong: this.props.bounds[0][1],
      swLat: this.props.bounds[1][0],
      swLong: this.props.bounds[1][1]
    }
    
    // fetch the Tim Hortons
    let url = `/query/getGeo?${new URLSearchParams(coordinates).toString()}`;
    let data = await fetch(url);
    let dataJson = await data.json();
    if (data.statusCode === 404) {
      console.log(data.statusMessage);
      return;
    }
    // sets the state
    this.setState({
      hortons: dataJson
    });
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.bounds !== this.props.bounds) {
      await this.fetchTimHortons();
    }
  }

  render() {
    return (
      <MapContainer
        center={this.props.center}
        zoom={this.props.zoom}
        minZoom={this.props.minZoom}
        maxZoom={this.props.maxZoom}
        zoomControl={false}
        updateWhenZooming={false}
        updateWhenIdle={true}
        preferCanvas={true}
        style={{ width: "100%", position: "absolute", top: 0, bottom: 0, zIndex: -1, }} >
        <TileLayer
          url={this.props.url}
          attribution={this.props.attribution} />
            
        <MarkerClusterGroup
          spiderfyOnMaxZoom={false}
          zoomToBoundsOnClick={true}
          showCoverageOnHover={true}
          removeOutsideVisibleBounds={false}
          disableClusteringAtZoom={18}>

          {/* renders the markers for the Tim Hortons within the bounds*/}
          {this.state.hortons.map((location, index) => 
            <CircleMarker
              key={index}
              color={"red"}
              radius={5}
              opacity={1}
              weight={1}
              center={[location.geo.coordinates[1].toString(),
                location.geo.coordinates[0].toString()]}

              eventHandlers={{
                click: () => {
                  this.setState({ activeHortons: location });
                }
              }}
            />
          )}
        </MarkerClusterGroup>

        {/* displays the Popup when a Tim Hortons is clicked */}
        {this.state.activeHortons
          ? <Popup className="custom"
            // eslint-disable-next-line max-len
            position={[this.state.activeHortons.geo.coordinates[1], this.state.activeHortons.geo.coordinates[0]]}
            onClose={() => {
              this.setState({ activeHortons: null });
            }}>
            <HortonTooltip
              address={this.state.activeHortons.address}
              phone={this.state.activeHortons.phone}
              driveThruHours={this.state.activeHortons.driveThruHours}
              diningHours={this.state.activeHortons.diningRoomHours}
            />
          </Popup>
          : <p></p>
        }

        {/* updates the bounds of HortonMapApp every time the map is
          zoomed and/or moved */}
        <MapMove action={this.props.boundsHandler} />
          
      </MapContainer>
    );
  }
}

export default HortonMap;