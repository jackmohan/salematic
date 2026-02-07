var async = require("async");
var moment = require('moment');
var pg = require('pg');
var conString = "postgres://magivauser:zRUu9D3BpA7a4CZA@localhost:5432/magivagps";
var client = new pg.Client(conString);
client.connect();

var NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: 'AIzaSyC48iodI8ddF9G6bexDttVew7byShw0lRY', 
    formatter: null        
};
var geocoder = NodeGeocoder(options);

exports.hourly_reports = function(res, hourlyArray, from_date, to_date, fuelInd, vehicles, groups, group_id, vehicle, login_name, pageName)
{
    // console.log(hourlyArray);
    var locationArr=[];
    var hourlyResult = [];
    var stTime;
    var stTimeFormat;
    var stDateFormat;
    var endTimeFormat;
    var endDateFormat;
    var distanceMilege;
    var fuelLevel;
    var i=0;
    async.each(hourlyArray, function (trip, callback) 
    {
        function get_location_fm(callback)
        {
            console.log(i + " : " + trip['vht_start_lat'] + " : " + trip['vht_start_long']);
            var lat = trip['vht_start_lat'];
            var lng = trip['vht_start_long'];
            client.query("select latlong_id, latlong_lattitude, latlong_longitude, latlong_address, latlong_city, latlong_state, latlong_dist, latlong_country, latlong_zip from latlong_table where latlong_lattitude = '"+lat+"' AND latlong_longitude = '"+lng+"'", function(err, result3) 
            {
                if(err)
                {
                    //console.log(err);
                }
                if(result3.rows.length > 0)
                {
                    // console.log("g1");
                    var nearAddr = result3.rows[0]['latlong_address'].split(', ');
                    // console.log(result3.rows[0]['latlong_address']+ ' - ' +nearAddr.length + 'geo');
                    var nearCity;
                    if(nearAddr.length >= 5)
                    {
                        nearCity = nearAddr[nearAddr.length - 4] + ', ' + nearAddr[nearAddr.length - 3]
                    }
                    else if(nearAddr.length == 4)
                    {
                        if(result3.rows[0]['latlong_city'] == result3.rows[0]['latlong_dist'])
                        {
                            nearCity = nearAddr[1] + ', ' + result3.rows[0]['latlong_city'];
                        }
                        else
                        {
                            if(result3.rows[0]['latlong_city'] == null)
                            {
                                nearCity = nearAddr[1] + ', '+ result3.rows[0]['latlong_dist'];
                            }
                            else
                            {
                                nearCity = nearAddr[1] + ', '+ result3.rows[0]['latlong_city'];
                            }
                            // nearCity = result3.rows[0]['latlong_city']+ ', '+ result3.rows[0]['latlong_dist'];                                                
                        }
                    }
                    else if(nearAddr.length == 3)
                    {
                        if(result3.rows[0]['latlong_street'] == null)
                        {
                            result3.rows[0]['latlong_street'] = nearAddr[0];
                        }
                        nearCity = result3.rows[0]['latlong_street']+ ', '+ result3.rows[0]['latlong_dist'];
                    }
                    else if(nearAddr.length == 2)
                    {
                        if(result3.rows[0]['latlong_street'] !== null && result3.rows[0]['latlong_city'] !== null)
                            nearCity = result3.rows[0]['latlong_street']+ ', '+ result3.rows[0]['latlong_city'];
                        else if(result3.rows[0]['latlong_street'] !== null && result3.rows[0]['latlong_dist'] !== null)
                            nearCity = result3.rows[0]['latlong_street']+ ', '+ result3.rows[0]['latlong_dist'];
                        else
                            nearCity = result3.rows[0]['latlong_address'];
                    }
                    // ress.send({"location" : result3.rows[0]['latlong_address'], "nearCity" : nearCity});
                    console.log("g1 : "  + nearCity)
                    callback(null, nearCity);
                }
                else
                {
                    var N =0.50;
                    var Min_lat = parseInt(lat) - (0.009 * N);
                    var Max_lat = parseInt(lat) + (0.009 * N);
                    var Min_lon = parseInt(lng) - (0.009 * N);
                    var Max_lon = parseInt(lng) + (0.009 * N);
                    client.query("select latlong_id, latlong_lattitude, latlong_longitude, latlong_address, latlong_city, latlong_state, latlong_dist, latlong_country, latlong_zip from latlong_table where (latlong_lattitude >= '"+Min_lat+"' AND  latlong_lattitude <= '"+Max_lat+"') AND (latlong_longitude >= '"+Min_lon+"' AND  latlong_longitude <= '"+Max_lon+"') order by latlong_id desc limit 1", function(err, result4) 
                    {
                        if(err)
                        {
                            //console.log(err);
                        }

                        if(result4.rows.length > 0)
                        {
                            
                            var nearCity;
                            var nearAddr = result4.rows[0]['latlong_address'].split(', ');
                            if(nearAddr.length >= 5)
                            {
                                nearCity = nearAddr[nearAddr.length - 4] + ', ' + nearAddr[nearAddr.length - 3]
                            }
                            else if(nearAddr.length == 4)
                            {
                                if(result4.rows[0]['latlong_city'] == result4.rows[0]['latlong_dist'])
                                {
                                    nearCity = nearAddr[1] + ', ' + result4.rows[0]['latlong_city'];
                                }
                                else
                                {
                                    if(result4.rows[0]['latlong_city'] == null)
                                    {
                                        nearCity = nearAddr[1] + ', '+ result4.rows[0]['latlong_dist'];
                                    }
                                    else
                                    {
                                        nearCity = nearAddr[1] + ', '+ result4.rows[0]['latlong_city'];
                                    }
                                    // nearCity = result4.rows[0]['latlong_city']+ ', '+ result4.rows[0]['latlong_dist'];                                                
                                }
                            }
                            else if(nearAddr.length == 3)
                            {
                                if(result4.rows[0]['latlong_street'] == null)
                                {
                                    result4.rows[0]['latlong_street'] = nearAddr[0];
                                }
                                nearCity = result4.rows[0]['latlong_street']+ ', '+ result4.rows[0]['latlong_dist'];
                            }
                            else if(nearAddr.length == 2)
                            {
                                if(result4.rows[0]['latlong_street'] !== null && result4.rows[0]['latlong_city'] !== null)
                                    nearCity = result4.rows[0]['latlong_street']+ ', '+ result4.rows[0]['latlong_city'];
                                else if(result4.rows[0]['latlong_street'] !== null && result4.rows[0]['latlong_dist'] !== null)
                                    nearCity = result4.rows[0]['latlong_street']+ ', '+ result4.rows[0]['latlong_dist'];
                                else
                                    nearCity = result4.rows[0]['latlong_address'];
                                
                            }
                            console.log("g2 : "  + nearCity);
                            // ress.send({"location" :  result4.rows[0]['latlong_address'], "nearCity" : nearCity});
                            callback(null, nearCity);
                        }
                        else
                        {
                            geocoder.reverse({lat:lat, lon:lng}, function(err, res) 
                            {
                                if(err)
                                {
                                    //console.log(err + ' : ' + lat + ' : ' + lng);
                                }
                                else
                                {
                                    var nearAddr = res[0]['formattedAddress'].split(', ');
                                    // console.log(res[0]['formattedAddress']+ ' - ' +nearAddr.length + 'geo');
                                    // console.log(nearAddr.length);
                                    var nearCity;
                                    if(nearAddr.length >= 5)
                                    {
                                        nearCity = nearAddr[nearAddr.length - 4] + ', ' + nearAddr[nearAddr.length - 3]
                                    }
                                    else if(nearAddr.length == 4)
                                    {
                                        if(res[0]['city'] == res[0]['administrativeLevels']['level2long'])
                                        {
                                            nearCity = nearAddr[1] + ', ' + res[0]['city'];
                                        }
                                        else
                                        {
                                            if(res[0]['city'] == null)
                                            {
                                                nearCity = nearAddr[1] + ', '+ res[0]['administrativeLevels']['level2long'];
                                            }
                                            else
                                            {
                                                nearCity = nearAddr[1] + ', '+ res[0]['administrativeLevels']['level2long'];
                                            }
                                            // nearCity = res[0]['city']+ ', '+ res[0]['administrativeLevels']['level2long'];
                                            
                                        }
                                    }
                                    else if(nearAddr.length == 3)
                                    {
                                        if(res[0]['streetName'] == null)
                                        {
                                            res[0]['streetName'] = nearAddr[0];
                                        }
                                        nearCity = res[0]['streetName']+ ', '+ res[0]['administrativeLevels']['level2long'];
                                    }
                                    client.query('INSERT into latlong_table(latlong_lattitude, latlong_longitude, latlong_address, latlong_dist, latlong_street, latlong_city, latlong_country, latlong_zip, latlong_state) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)', [lat, lng, res[0]['formattedAddress'], res[0]['administrativeLevels']['level2long'], res[0]['streetName'], res[0]['city'], res[0]['country'], res[0]['zipcode'], res[0]['administrativeLevels']['level1short']], function(err, result)
                                    {
                                        if (err)
                                        {
                                            //console.log('Location Table Insert Query Error:'+err);
                                        }
                                        else
                                        {                                                         
                                        // console.log('latlong_table insert successfully');
                                        }
                                    });
                                    console.log("g3 : "  + nearCity);
                                    // ress.send({"location" : res[0]['formattedAddress'], "nearCity" : nearCity});
                                    callback(null, nearCity);
                                }
                                
                            }); 
                        }
                    });
                }
            });       
            
        }
        function get_location_to(callback)
        {
            lat = trip['vht_end_lat'];
            lng = trip['vht_end_long'];
            // console.log("select latlong_id, latlong_lattitude, latlong_longitude, latlong_address, latlong_city, latlong_state, latlong_dist, latlong_country, latlong_zip from latlong_table where latlong_lattitude = '"+lat+"' AND latlong_longitude = '"+lng+"'");
            client.query("select latlong_id, latlong_lattitude, latlong_longitude, latlong_address, latlong_city, latlong_state, latlong_dist, latlong_country, latlong_zip from latlong_table where latlong_lattitude = '"+lat+"' AND latlong_longitude = '"+lng+"'", function(err, result3) 
            {
                if(err)
                {
                    console.log(err);
                }
                if(result3.rows.length > 0)
                {
                    // console.log("g1");
                    var nearAddr = result3.rows[0]['latlong_address'].split(', ');
                    // console.log(result3.rows[0]['latlong_address']+ ' - ' +nearAddr.length + 'geo');
                    var nearCity;
                    if(nearAddr.length >= 5)
                    {
                        nearCity = nearAddr[nearAddr.length - 4] + ', ' + nearAddr[nearAddr.length - 3]
                    }
                    else if(nearAddr.length == 4)
                    {
                        if(result3.rows[0]['latlong_city'] == result3.rows[0]['latlong_dist'])
                        {
                            nearCity = nearAddr[1] + ', ' + result3.rows[0]['latlong_city'];
                        }
                        else
                        {
                            if(result3.rows[0]['latlong_city'] == null)
                            {
                                nearCity = nearAddr[1] + ', '+ result3.rows[0]['latlong_dist'];
                            }
                            else
                            {
                                nearCity = nearAddr[1] + ', '+ result3.rows[0]['latlong_city'];
                            }
                            // nearCity = result3.rows[0]['latlong_city']+ ', '+ result3.rows[0]['latlong_dist'];                                                
                        }
                    }
                    else if(nearAddr.length == 3)
                    {
                        if(result3.rows[0]['latlong_street'] == null)
                        {
                            result3.rows[0]['latlong_street'] = nearAddr[0];
                        }
                        nearCity = result3.rows[0]['latlong_street']+ ', '+ result3.rows[0]['latlong_dist'];
                    }
                    else if(nearAddr.length == 2)
                    {
                        if(result3.rows[0]['latlong_street'] !== null && result3.rows[0]['latlong_city'] !== null)
                            nearCity = result3.rows[0]['latlong_street']+ ', '+ result3.rows[0]['latlong_city'];
                        else if(result3.rows[0]['latlong_street'] !== null && result3.rows[0]['latlong_dist'] !== null)
                            nearCity = result3.rows[0]['latlong_street']+ ', '+ result3.rows[0]['latlong_dist'];
                        else
                            nearCity = result3.rows[0]['latlong_address'];
                    }
                    console.log("g1t : "  + nearCity)
                    // ress.send({"location" : result3.rows[0]['latlong_address'], "nearCity" : nearCity});
                    callback(null, nearCity);
                }
                else
                {
                    var N =0.5;
                    var Min_lat = parseInt(lat) - (0.009 * N);
                    var Max_lat = parseInt(lat) + (0.009 * N);
                    var Min_lon = parseInt(lng) - (0.009 * N);
                    var Max_lon = parseInt(lng) + (0.009 * N);
                    client.query("select latlong_id, latlong_lattitude, latlong_longitude, latlong_address, latlong_city, latlong_state, latlong_dist, latlong_country, latlong_zip from latlong_table where (latlong_lattitude >= '"+Min_lat+"' AND  latlong_lattitude <= '"+Max_lat+"') AND (latlong_longitude >= '"+Min_lon+"' AND  latlong_longitude <= '"+Max_lon+"') order by latlong_id desc limit 1", function(err, result4) 
                    {
                        if(err)
                        {
                            //console.log(err);
                        }

                        if(result4.rows.length > 0)
                        {
                            
                            var nearCity;
                            var nearAddr = result4.rows[0]['latlong_address'].split(', ');
                            if(nearAddr.length >= 5)
                            {
                                nearCity = nearAddr[nearAddr.length - 4] + ', ' + nearAddr[nearAddr.length - 3]
                            }
                            else if(nearAddr.length == 4)
                            {
                                if(result4.rows[0]['latlong_city'] == result4.rows[0]['latlong_dist'])
                                {
                                    nearCity = nearAddr[1] + ', ' + result4.rows[0]['latlong_city'];
                                }
                                else
                                {
                                    if(result4.rows[0]['latlong_city'] == null)
                                    {
                                        nearCity = nearAddr[1] + ', '+ result4.rows[0]['latlong_dist'];
                                    }
                                    else
                                    {
                                        nearCity = nearAddr[1] + ', '+ result4.rows[0]['latlong_city'];
                                    }
                                    // nearCity = result4.rows[0]['latlong_city']+ ', '+ result4.rows[0]['latlong_dist'];                                                
                                }
                            }
                            else if(nearAddr.length == 3)
                            {
                                if(result4.rows[0]['latlong_street'] == null)
                                {
                                    result4.rows[0]['latlong_street'] = nearAddr[0];
                                }
                                nearCity = result4.rows[0]['latlong_street']+ ', '+ result4.rows[0]['latlong_dist'];
                            }
                            else if(nearAddr.length == 2)
                            {
                                if(result4.rows[0]['latlong_street'] !== null && result4.rows[0]['latlong_city'] !== null)
                                    nearCity = result4.rows[0]['latlong_street']+ ', '+ result4.rows[0]['latlong_city'];
                                else if(result4.rows[0]['latlong_street'] !== null && result4.rows[0]['latlong_dist'] !== null)
                                    nearCity = result4.rows[0]['latlong_street']+ ', '+ result4.rows[0]['latlong_dist'];
                                else
                                    nearCity = result4.rows[0]['latlong_address'];
                                
                            }
                            console.log("g2t : "  + nearCity);
                            // ress.send({"location" :  result4.rows[0]['latlong_address'], "nearCity" : nearCity});
                            callback(null, nearCity);
                        }
                        else
                        {
                            geocoder.reverse({lat:lat, lon:lng}, function(err, res) 
                            {
                                if(err)
                                {
                                    //console.log(err + ' : ' + lat + ' : ' + lng);
                                }
                                else
                                {
                                    var nearAddr = res[0]['formattedAddress'].split(', ');
                                    // console.log(res[0]['formattedAddress']+ ' - ' +nearAddr.length + 'geo');
                                    // console.log(nearAddr.length);
                                    var nearCity;
                                    if(nearAddr.length >= 5)
                                    {
                                        nearCity = nearAddr[nearAddr.length - 4] + ', ' + nearAddr[nearAddr.length - 3]
                                    }
                                    else if(nearAddr.length == 4)
                                    {
                                        if(res[0]['city'] == res[0]['administrativeLevels']['level2long'])
                                        {
                                            nearCity = nearAddr[1] + ', ' + res[0]['city'];
                                        }
                                        else
                                        {
                                            if(res[0]['city'] == null)
                                            {
                                                nearCity = nearAddr[1] + ', '+ res[0]['administrativeLevels']['level2long'];
                                            }
                                            else
                                            {
                                                nearCity = nearAddr[1] + ', '+ res[0]['administrativeLevels']['level2long'];
                                            }
                                            // nearCity = res[0]['city']+ ', '+ res[0]['administrativeLevels']['level2long'];
                                            
                                        }
                                    }
                                    else if(nearAddr.length == 3)
                                    {
                                        if(res[0]['streetName'] == null)
                                        {
                                            res[0]['streetName'] = nearAddr[0];
                                        }
                                        nearCity = res[0]['streetName']+ ', '+ res[0]['administrativeLevels']['level2long'];
                                    }
                                    client.query('INSERT into latlong_table(latlong_lattitude, latlong_longitude, latlong_address, latlong_dist, latlong_street, latlong_city, latlong_country, latlong_zip, latlong_state) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)', [lat, lng, res[0]['formattedAddress'], res[0]['administrativeLevels']['level2long'], res[0]['streetName'], res[0]['city'], res[0]['country'], res[0]['zipcode'], res[0]['administrativeLevels']['level1short']], function(err, result)
                                    {
                                        if (err)
                                        {
                                            //console.log('Location Table Insert Query Error:'+err);
                                        }
                                        else
                                        {                                                         
                                        // console.log('latlong_table insert successfully');
                                        }
                                    });
                                    console.log("g3t : "  + nearCity);
                                    // ress.send({"location" : res[0]['formattedAddress'], "nearCity" : nearCity});
                                    callback(null, nearCity);
                                }
                                
                            }); 
                        }
                    });
                }
            });  
            // callback(null, 0);                        
        }
        locationArr.push(get_location_fm);
        locationArr.push(get_location_to);
        async.parallel(locationArr, function(err, result2)
        {
            // client.release();
            if(err) console.log(err);
            // var hourlyResult = [];
            console.log(result2[0] +' ::: '+ result2[1]);
            
            stTime = moment(trip['vht_device_startdatetime']);
            stTimeFormat = stTime.format('hh A');
            stDateFormat = stTime.format('ddd D MMM YYYY');
            endTime = moment(trip['vht_device_enddatetime']);
            endTimeFormat = endTime.format('hh A');
            endDateFormat = endTime.format('ddd D MMM YYYY');
            distanceMilege = parseFloat(trip['vht_end_mileage']) - parseFloat(trip['vht_start_mileage']);
            if(distanceMilege != 0)
            {
                distanceMilege = distanceMilege.toFixed(2);
            }
            // console.log(parseFloat(trip['vht_fuel_start_capacity']) + ' -- ' + parseFloat(trip['vht_fuel_end_capacity']) + ' -- ' + parseFloat(chkNull(trip['vht_refill_ltrs'])));
            if(chkNull(trip['vht_fuel_start_capacity']) != 0 && chkNull(trip['vht_fuel_end_capacity']) != 0)
            {
                fuelLevel = parseFloat(trip['vht_fuel_start_capacity']) - parseFloat(trip['vht_fuel_end_capacity']) + parseFloat(chkNull(trip['vht_refill_ltrs']));
                if(fuelLevel > 0)
                {
                    fuelLevel = fuelLevel.toFixed(2);
                }
                else
                {
                    fuelLevel = 0;
                }
                
            }
            else
            {
                fuelLevel = 0;
            }
            if(distanceMilege != 0 && fuelLevel != 0)
            {
                mileage = parseFloat(distanceMilege) / parseFloat(fuelLevel);
                mileage = mileage.toFixed(2);
            }
            else
            {
                mileage = 0;
            }
            // console.log(fuelLevel + ' -- ' + mileage + ' -- ' + distanceMilege);
            // console.log(distanceMilege);
            console.log("I VAL : " + i);
            hourlyResult.push({'stTimeFormat': stTimeFormat, 'stDateFormat': stDateFormat, 'endDateFormat' : endDateFormat, 'endTimeFormat' : endTimeFormat, 'distanceMilege' : distanceMilege,'fuelLevel': fuelLevel, 'mileage' : mileage, 'stLocation' : result2[0], 'endLocation' : result2[1], 'fmDtFormat': moment(trip['vht_device_startdatetime']).format('DD/MM/YYYY hh:00 A'), 'toDtFormat': moment(trip['vht_device_enddatetime']).format('DD/MM/YYYY hh:00 A')}); 
            console.log(hourlyResult);
            console.log(hourlyArray.length + ' == ' + hourlyResult.length);
            if(hourlyArray.length ==  hourlyResult.length)
            {
                // console.log(hourlyResult);
                callback(hourlyResult);
            }
            
        });
       
    }, function(fuelResult) { 
        
        res.render(pageName,{ title: 'Hourly Report', 'from_date': from_date, 'to_date': to_date, fuelInd : fuelInd, 'vehicles' : vehicles, 'groups': groups, 'group_id' : group_id, 'vehicle': vehicle, 'trip_summary': fuelResult,  'login_name' : login_name});
       
    });
};

function chkNull(value,ind)
{
    if(value == null || value == '')
    {
        return 0;
    }
    else
    {
        if(ind == 1)
        {
            var value = parseFloat(value).toFixed(2);
            return value;
        }
        else
        {
            return value;
        }
        
    }
}