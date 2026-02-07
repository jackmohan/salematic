var con = require('../db/db');
var express = require('express');
var moment = require('moment');
var async = require("async");
var common = require('../common/common-function');
var app = express();
con = con.connection();
var NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: 'AIzaSyBnh66VQSyMOWUeiT1MiSPUd2Dj1oMvGZU', 
    formatter: null        
};
var geocoder = NodeGeocoder(options);

exports.getLocation = function(req, ress)
{
    con.connect(function (err, client, done) {
        if(err)
        {
            console.log("Connection Error: " + err);
        }

        else
        {
            var lat = req.latitude;
            var lng = req.longitude;
            console.log("Number : " + req.latitude + ' , ' + req.longitude);
    
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
                    ress.send({"location" : result3.rows[0]['latlong_address'], "nearCity" : nearCity});
                }
                else
                {
                    var N =0.25;
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
                            // console.log("g2");
                            ress.send({"location" :  result4.rows[0]['latlong_address'], "nearCity" : nearCity});
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
                                    // console.log("g3");
                                    ress.send({"location" : res[0]['formattedAddress'], "nearCity" : nearCity});
                                }
                                
                            }); 
                        }
                    });
                }
            });
        }
    });

}