import { Component } from "react";
import "./styles/HortonToolTip.css";
import coffee from "./icons/coffee-cup.png";
import bullet from "./icons/right-arrow.png";

class HortonTooltip extends Component {
  
  constructor(props) {
    super(props);
    this.renderDriveTruHours = this.renderDriveTruHours.bind(this);
    this.renderDiningHours = this.renderDiningHours.bind(this);
    this.handleClickDriveThru = this.handleClickDriveThru.bind(this);
    this.handleClickDiningHours = this.handleClickDiningHours.bind(this);
  }
  
  /**
   * Creates an array of paragraph elements containing the day and the opening and closing hours
   * of the drive thru of a Tim Hortons' location.
   * @param {Object} hours 
   * @returns An array of p elements
   */
  renderDriveTruHours(hours) {
    let schedule = [];
    for (const day in hours) {
      // eslint-disable-next-line security/detect-object-injection
      schedule.push(<p>{day} {this.props.driveThruHours[day]}</p>);
    }
    return schedule;
  }

  /**
   * Creates an array of paragraph elements containing the day and the opening and closing hours
   * of the dining hours of a Tim Horton's location.
   * @param {Object} hours 
   * @returns An array of p elements
   */
  renderDiningHours(hours) {
    let schedule = [];
    for (const day in hours) {
      // eslint-disable-next-line security/detect-object-injection
      schedule.push(<p>{day} {this.props.diningHours[day]}</p>);
    }
    return schedule;
  }

  /**
   * Event handler when the drive thru hours title or the bullet beside the title is clicked.
   * The hours will be displayed or hidden when the above is clicked and the bullet will 
   * rotate accordingly to the display of the hours. 
   * @param {Event} event 
   */
  handleClickDriveThru() {
    let hours = document.getElementById("driveThruHours");
    let style = hours.style.display;
    let bullet = document.getElementById("driveThruBullet");

    if (style === "none") {
      bullet.style.transform = "rotate(90deg)";
      hours.style.display = "block";
    } else {
      bullet.style.transform = "rotate(0deg)";
      hours.style.display = "none";
    }
  }

  /**
   * Event handler when the dining hours title or the bullet beside the title is clicked.
   * The hours will be displayed or hidden when the above is clicked and the bullet will 
   * rotate accordingly to the display of the hours. 
   * @param {Event} event 
   */
  handleClickDiningHours() {
    let hours = document.getElementById("diningRoomHours");
    let style = hours.style.display;
    let bullet = document.getElementById("diningBullet");
    
    if (style === "none") {
      bullet.style.transform = "rotate(90deg)";
      hours.style.display = "block";
    } else {
      bullet.style.transform = "rotate(0deg)";
      hours.style.display = "none";
    }
  }

  /**
   * Needed so that when a new marker is clicked, the hours that were previously displayed 
   * (from a previous marker) don't show in the tooltip. The bullet beside the title will also 
   * be rotated accordingly depending on the visibility of the hours.  
   */
  componentDidUpdate() {
    let diningHours = document.getElementById("diningRoomHours");
    let driveThruHours = document.getElementById("driveThruHours");
    let diningBullet = document.getElementById("diningBullet");
    let driveThruBullet = document.getElementById("driveThruBullet");
    // If the dining hours/drive thru hours isn't null that means it's currently displayed
    // on the screen. So they will be set to hidden and the bullet will be rotated to its original
    // position. We are checking if the hours aren't null individually because it's possible that 
    // in a previous tooltip, the hours weren't clicked on.
    if (diningHours !== null) {
      diningBullet.style.transform = "rotate(0deg)";
      diningHours.style.display = "none";
    } 
    if (driveThruHours !== null) {
      driveThruBullet.style.transform = "rotate(0deg)";
      driveThruHours.style.display = "none";
    }
  }

  render() {
    return (
      <article>
        <section>
          <h2>{this.props.address}</h2>
          <br />
          <h2>Phone Number </h2>
          <p>{this.props.phone}</p>
          <br />
          <div className="hoursTitle">
            <img className="bullets" id="driveThruBullet" src={bullet}
              onClick={this.handleClickDriveThru} />
            <h2 className="hours" onClick={this.handleClickDriveThru}>Drive Thru Hours</h2>
          </div>
          <div id="driveThruHours" hidden>
            {this.renderDriveTruHours(this.props.driveThruHours)}
          </div>
          <br />
          <div className="hoursTitle">
            <img className="bullets" id="diningBullet" src={bullet}
              onClick={this.handleClickDiningHours} />
            <h2 className="hours" onClick={this.handleClickDiningHours}>
              Dining Hours</h2>
          </div>
          <div id="diningRoomHours" hidden>
            {this.renderDiningHours(this.props.driveThruHours)}
          </div>
          <br />
          <img id="coffee_icon" src={coffee}/>
        </section>
      </article>
    )
  }
}

export default HortonTooltip;