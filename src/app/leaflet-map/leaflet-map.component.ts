import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.css'],
  standalone: true,
  imports: [FormsModule], // Include FormsModule for ngModel
})
export class MapComponent implements OnInit {
  map: any;
  mainPoint = { lat: 0, lng: 0, radius: 1000 }; // Default values
  newPoint = { lat: '', lng: '', distance: 0 };
  additionalPoints: any[] = [];
  pointsInsideRadius = 0;

  mainMarker: any;
  mainCircle: any;

  ngOnInit(): void {
    this.initMap();
  }

  // Initialize the map
  initMap(): void {
    this.map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);
  }

  // Update the main point on the map
  updateMainPoint(): void {
    const { lat, lng, radius } = this.mainPoint;

    // Remove existing layers
    if (this.mainMarker) this.map.removeLayer(this.mainMarker);
    if (this.mainCircle) this.map.removeLayer(this.mainCircle);

    // Create a custom blue icon for the main point
    const blueIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Add the main marker with custom icon
    this.mainMarker = L.marker([+lat, +lng], { icon: blueIcon }).addTo(this.map);

    // Create the main point's circle
    this.mainCircle = L.circle([+lat, +lng], {
      radius: +radius,
      color: 'green',
      fillOpacity: 0.2,
    }).addTo(this.map);

    // Update additional points
    this.updateAdditionalPoints();
    this.map.setView([+lat, +lng], 10);
  }

  // Add a new additional point to the map
  addAdditionalPoint(): void {
    const { lat, lng } = this.newPoint;
    if (!lat || !lng) return;

    // Calculate distance from the main point
    const distance = this.calculateDistance(
      { lat: +this.mainPoint.lat, lng: +this.mainPoint.lng },
      { lat: +lat, lng: +lng }
    );

    // Add the point to the list of additional points
    this.additionalPoints.push({ lat: +lat, lng: +lng, distance });

    // Set the distance value in the form
    this.newPoint.distance = distance;

    // Update additional points on the map
    this.updateAdditionalPoints();
  }

  // Update the markers for all additional points
  updateAdditionalPoints(): void {
    this.pointsInsideRadius = 0;

    this.additionalPoints.forEach((point) => {
      if (point.marker) this.map.removeLayer(point.marker);

      // Create the circle marker for the additional point
      const markerOptions = {
        radius: 6,
        fillColor: point.distance <= this.mainPoint.radius ? 'yellow' : 'red',
        color: 'black', // Border color
        weight: 1,
        fillOpacity: 0.8,
      };

      point.marker = L.circleMarker([point.lat, point.lng], markerOptions)
        .bindPopup(`Lat: ${point.lat}, Lng: ${point.lng}, Dist: ${point.distance.toFixed(2)}m`)
        .addTo(this.map);

      // Check if the point is inside the main point's radius
      if (point.distance <= this.mainPoint.radius) {
        this.pointsInsideRadius++;
      }
    });
  }

  // Calculate the distance between two geographic points
  calculateDistance(coord1: any, coord2: any): number {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const R = 6371e3; // Earth radius in meters
    const φ1 = toRad(coord1.lat);
    const φ2 = toRad(coord2.lat);
    const Δφ = toRad(coord2.lat - coord1.lat);
    const Δλ = toRad(coord2.lng - coord1.lng);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Return the distance in meters
  }
}
