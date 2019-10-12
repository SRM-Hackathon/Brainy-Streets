
var platform = new H.service.Platform({
    'apikey': 'wGiMGJ08JeH-vLU5d9E1w_v_h0AyvMbLgn69GN6qen0'
});

var geocoder = platform.getGeocodingService();

var coordinates = {};

var cacheddaynight = "day";
inputInto = null;

window.onload = function () {
    $('#ambulanceSection').hide();
    $('#barricadeSection').hide();
}

function ambulanceMode() {
    $('#selectedmodetext').text('Ambulance Mode');
    $('#ambulanceSection').show();
    $('#barricadeSection').hide();

}

function barricadeMode() {
    $('#selectedmodetext').text('Barricade Mode');
    $('#ambulanceSection').hide();
    $('#barricadeSection').show();
}

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
                document.getElementById('userlocation').innerHTML = data.Response.View[0].Result[0].Location.Address.Label;
            }, error => {
                console.error(error);
            }
        );

        coordinates = position.coords;

        // Instantiate (and display) a map object:
        newmap(position.coords.latitude, position.coords.longitude, "day");
    });
}

function daynightclicked(daynight) {
    if(coordinates && cacheddaynight != daynight)
    {
        newmap(coordinates.latitude, coordinates.longitude, daynight);
    }
}

function newmap(latitude, longitude, daynight) {
    if(daynight=="night")
    {
        lineColor = "#FFFF00",
        pointColor = "#000000",
        barricadedLineColor = "#FF0000"
    }
    else{
        lineColor = "#000000",
        pointColor = "#FFFFFF",
        barricadedLineColor = "#FF0000"
    }
    const canvas = document.getElementById('map');
    const map = new harp.MapView({
    canvas,
    theme: "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_"+daynight+"_reduced.json",
    //For tile cache optimization:
    maxVisibleDataSourceTiles: 40,
    tileCacheSize: 100
    });

    map.setCameraGeolocationAndZoom(
        new harp.GeoCoordinates(latitude-0.01, longitude),
        16
    );

    console.log(latitude, longitude);

    const mapControls = new harp.MapControls(map);
    const ui = new harp.MapControlsUI(mapControls);
    canvas.parentElement.appendChild(ui.domElement);

    mapControls.maxPitchAngle = 90;
    mapControls.setRotation(0,50);

    map.resize(document.getElementById('mapdiv').clientWidth, document.getElementById('mapdiv').clientHeight);
    window.onresize = () => {
        map.resize(document.getElementById('mapdiv').clientWidth, document.getElementById('mapdiv').clientHeight);
        canvas.height = document.getElementById('mapdiv').clientHeight;
        canvas.width = document.getElementById('mapdiv').clientWidth;
    }

    const omvDataSource = new harp.OmvDataSource({
    baseUrl: "https://xyz.api.here.com/tiles/herebase.02",
    apiFormat: harp.APIFormat.XYZOMV,
    styleSetName: "tilezen",
    authenticationCode: 'AOSoVWzHTbZ1FI7p9W795eI',
    });

    map.addDataSource(omvDataSource);

    user_location = {
        "type": "FeatureCollection",

        "features": [
        { "type": "Feature", "geometry": { "type": "Point", "coordinates": [ longitude, latitude, 0.0 ] } }
        ]
    }

    const location_geoJsonDataProvider = new harp.GeoJsonDataProvider("user_location", user_location);
    const location_geoJsonDataSource = new harp.OmvDataSource({
        dataProvider: location_geoJsonDataProvider,
        name: "user_location",
    });

    map.addDataSource(location_geoJsonDataSource).then(() => {
        const styles = [
        {
            when: "$geometryType == 'point'",
            technique: "circles",
            renderOrder: 1000,
            attr: {
                color: "#0000ff",
                size: 15
            }
        }
        ]
        location_geoJsonDataSource.setStyleSet(styles);
        map.update();
    });


    fetch(window.location.href.split('/').slice(0,3).join('/')+'/api/get-geojson/'+latitude.toString()+"/"+longitude.toString())
    .then(data => data.json())
    .then(data => {
        console.log(data);
        open_roads = {type: "FeatureCollection", features: []}
        closed_roads = {type: "FeatureCollection", features: []}
        for(feature of data.features)
        {
            if(feature.properties.barricade)
                closed_roads.features.push(feature);
            else
                open_roads.features.push(feature);
        }

        const closed_geoJsonDataProvider = new harp.GeoJsonDataProvider("closed_roads", closed_roads);
        const closed_geoJsonDataSource = new harp.OmvDataSource({
            dataProvider: closed_geoJsonDataProvider,
            name: "closed_roads",
            //styleSetName: "wireless-hotspots" NOTE: Not necessary here. For use if you want to add your style rules in the external stylesheet.
        });

        map.addDataSource(closed_geoJsonDataSource).then(() => {
            const styles = [
            {
            when: "$geometryType == 'point'",
            technique: "circles",
            renderOrder: 1000,
            attr: {
                color: pointColor,
                size: 15
            }
            },
            {
                "when": "$geometryType ^= 'line'",
                renderOrder: 10000,
                technique: "solid-line",
                attr: {
                color: barricadedLineColor,
                opacity: 1,
                metricUnit: "Pixel",
                lineWidth: 10
                }
            }
            ]
            closed_geoJsonDataSource.setStyleSet(styles);
            map.update();
        });

        const open_geoJsonDataProvider = new harp.GeoJsonDataProvider("open_roads", open_roads);
        const open_geoJsonDataSource = new harp.OmvDataSource({
            dataProvider: open_geoJsonDataProvider,
            name: "open_roads",
            //styleSetName: "wireless-hotspots" NOTE: Not necessary here. For use if you want to add your style rules in the external stylesheet.
        });

        map.addDataSource(open_geoJsonDataSource).then(() => {
            const styles = [
            {
            when: "$geometryType == 'point'",
            technique: "circles",
            renderOrder: 1000,
            attr: {
                color: pointColor,
                size: 15
            }
            },
            {
                "when": "$geometryType ^= 'line'",
                renderOrder: 10000,
                technique: "solid-line",
                attr: {
                color: lineColor,
                opacity: 1,
                metricUnit: "Pixel",
                lineWidth: 10
                }
            }
            ]
            open_geoJsonDataSource.setStyleSet(styles);
            map.update();
        });

        canvas.onclick = evt => {
            const geoPosition = map.getGeoCoordinatesAt(evt.pageX, evt.pageY);
            if (geoPosition.latitude >= 0)
            {
                lat = "°N, ";
            }
            else
            {
                geoPosition.latitude = -geoPosition.latitude;
                lat = "°S, ";
            }
            if (geoPosition.longitude >= 0)
            {
                long = "°E";
            }
            else
            {
                geoPosition.longitude = -geoPosition.longitude;
                long = "°W";
            }
            $('#selectedpointtext').text(geoPosition.latitude.toFixed(6) + lat + geoPosition.longitude.toFixed(6) + long);
        }
    })
}