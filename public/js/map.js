function initMap() {
    const [longitude, latitude] = coordinates;
    const position = { lat: latitude, lng: longitude };

    // Create the map
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: position,
        mapId: "e1f56a4ddbb5d3e73b1d9dda", // You can change this to your map ID
    });
    
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: "Your Hotel Location",
    });
}