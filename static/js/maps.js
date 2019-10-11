
var platform = new H.service.Platform({
    'apikey': 'wGiMGJ08JeH-vLU5d9E1w_v_h0AyvMbLgn69GN6qen0'
});

var geocoder = platform.getGeocodingService();

// Obtain the default map types from the platform object:
var defaultLayers = platform.createDefaultLayers();

// Gives user's location
if(navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(position => {

        console.log(position);

        // Get address from lat and long
        geocoder.reverseGeocode(
            {
                mode: "retrieveAddresses",
                maxresults: 1,
                prox: position.coords.latitude.toString() + ',' + position.coords.longitude.toString()
            }, data => {
                console.log(data.Response.View[0].Result[0].Location.Address.Label);
                document.getElementById('userlocation').innerHTML = data.Response.View[0].Result[0].Location.Address.Label;
            }, error => {
                console.error(error);
            }
        );

        // Instantiate (and display) a map object:
        var map = new H.Map(
            document.getElementById('wizmap'),
            defaultLayers.vector.normal.map,
            {
                zoom: 12,
                center: {lat: position.coords.latitude, lng: position.coords.longitude}
            }
        );
        // resize on window resize
        window.addEventListener('resize', function () {
            map.getViewPort().resize();
        });
    });
}
else
{
    var map = new H.Map(
        document.getElementById('wizmap'),
        defaultLayers.vector.normal.map,
        {
            zoom: 12,
            center: {lat: 19.209845, lng: 72.871603}
        }
    );
    // resize on window resize
    window.addEventListener('resize', function () {
        map.getViewPort().resize();
    });
    console.log('Mumbai');
    document.getElementById('userlocation').innerHTML = "Mumbai";
}