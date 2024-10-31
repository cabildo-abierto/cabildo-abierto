"use client"
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

const ArgentinaMap = ({usersByLocation}: {usersByLocation: {nombre: string, count: number}[]}) => {
  const [provinces, setProvinces] = useState(null);

  useEffect(() => {
    fetch("https://apis.datos.gob.ar/georef/api/provincias")
      .then((response) => response.json())
      .then((data) => setProvinces(data.provincias));
  }, []);

  const getRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);

  // Function to get the user count for a province
  const getUserCount = (provinceName) => {
    const provinceData = usersByLocation.find((item) => item.nombre === provinceName);
    return provinceData ? provinceData.count : 0;
  };

  return (
    <MapContainer style={{ height: '1100px', width: '450px' }} center={[-41, -65]} zoom={5}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {provinces && provinces.map((province) => {
        const userCount = getUserCount(province.nombre);
        const radius = Math.sqrt(userCount) * 2;

        return (
          <CircleMarker
            key={province.nombre}
            center={[province.centroide.lat, province.centroide.lon]}
            radius={radius > 0 ? radius : 5}
            fillColor={getRandomColor()}
            fillOpacity={0.7}
            weight={0} 
          >
            <Popup>{`${province.nombre}: ${userCount} usuarios`}</Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
};

export default ArgentinaMap;
