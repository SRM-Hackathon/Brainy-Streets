
var platform = new H.service.Platform({
    'apikey': 'wGiMGJ08JeH-vLU5d9E1w_v_h0AyvMbLgn69GN6qen0'
});

var geocoder = platform.getGeocodingService();

var coordinates = {};

var cacheddaynight = "day";

window.onload = function () {
    makeChart("Click on a sensor to see graphs", null, "");
}

function makeChart(label, data, container) {
    if(data)
    {
        data_obj = [{
            type: "line",
            lineColor: "#ff0000",
            dataPoints: data
        }];
    }
    else{
        data_obj = [];
    }
    chart = new CanvasJS.Chart(container+"chartContainer", {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: label,
        },
        axisY:{
            includeZero: false
        },
        data: data_obj
    });
    if(chart)
        chart.render();
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
        new harp.GeoCoordinates(latitude, longitude),
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
            document.getElementById('selectedpointtext').innerText = geoPosition.latitude.toFixed(6) + lat + geoPosition.longitude.toFixed(6) + long;

            // console.log(geoPosition);

            // get data from server for geoPosition coordinates
            fetch(window.location.href.split('/').slice(0,3).join('/')+'/api/get-data/'+geoPosition.latitude.toString()+"/"+geoPosition.longitude.toString())
            .then(data => data.json())
            .then(data => {
            // console.log(data);
            if(data.data.length)
            {
                // document.getElementById('selectedpointtext').innerText += "<br>"+JSON.stringify(data.data);
                var organised_AQIdata = [];
                var organised_LDRdata = [];
                var organised_trafficdata = [];
                for(i=0;i<data.data.length;i++)
                {
                    organised_AQIdata.push({y: parseFloat(data.data[i].aqi)})
                    organised_LDRdata.push({y: parseInt(data.data[i].ldr)})
                    organised_trafficdata.push({y: parseInt(data.data[i].hits)})
                }
                makeChart("Air Quality Index", organised_AQIdata, "AQI");
                makeChart("Light Density", organised_LDRdata, "LDR");
                makeChart("Traffic Density", organised_trafficdata, "Traffic");
            }
            else
            {
                makeChart("Click on a sensor to see graphs", null, "");
                makeChart("", null, "");
                makeChart("", null, "");
            }
            });

        }
    })
}