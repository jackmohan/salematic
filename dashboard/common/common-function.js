var moment = require('moment');
var con = require('../db/db');
var NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: 'AIzaSyBnh66VQSyMOWUeiT1MiSPUd2Dj1oMvGZU', 
    formatter: null        
};
var geocoder = NodeGeocoder(options);
con = con.connection();

exports.hoursMins = function(totalSeconds, ind = '')
{
    var hours   = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
    var seconds = totalSeconds - (hours * 3600) - (minutes * 60);
    var days = Math.floor(totalSeconds / (3600*24));
    // round seconds
    seconds = Math.round(seconds * 100) / 100
    // console.log("Days : " + days);
    var result = '';
    // var hrs = (hours < 10 ? "00" + hours : hours);
    // var mins = (minutes < 10 ? "00" + minutes : minutes);
    // if(hrs != 0)
    // {
    //     result = hrs + ' h ';
    // }
    // if(mins != 0)
    // {
    //     result += mins + ' mins ';
    // }
    // if((hrs == 0) && (mins == 0))
    // {
    //     result = '01 min';
    // }
    if(ind != '' && ind == 1)
    {
        if((hours < 0))
        {
            result += hours + ' h ';
        }
        else
        {
            result += (hours < 10 ? "0" + hours : hours) + ' h ';
        }
        result += (minutes < 10 ? "0" + minutes : minutes) + ' m ';
        // result += (seconds  < 10 ? "0" + seconds : seconds);
    }
    else
    {
        if((hours < 0))
        {
            result += hours + ' h ';
            result += (minutes < 10 ? "0" + minutes : minutes) + ' m ';
        }
        else if(hours > 25)
        {
            result += days + ' days ';
        }
        else
        {
            result += (hours < 10 ? "0" + hours : hours) + ' h ';
            result += (minutes < 10 ? "0" + minutes : minutes) + ' m ';
        }
        
        
    }
    return result;
}

exports.intervals = function(startString, endString, minutes, flag) {
    var start = moment(startString, 'YYYY-MM-DD HH:mm');
    var end = moment(endString, 'YYYY-MM-DD HH:mm');

    // round starting minutes up to nearest 15 (12 --> 15, 17 --> 30)
    // note that 59 will round up to 60, and moment.js handles that correctly
    start.minutes(Math.ceil(start.minutes() / minutes) * minutes);

    var result = [];

    var current = moment(start);

    while (current <= end) {
        if(flag == 1)
        {
            result.push(current.format('YYYY-MM-DD'));
        }
        else
        {
            result.push(current.format('YYYY-MM-DD HH:mm'));
        }        
        current.add(minutes, 'minutes');
    }

    return result;
}

exports.toGMT =  function toGMT(getDate)
{
    var gdate = new Date(getDate);
    var GMTdate = gdate.toGMTString();
    var getmonth = (parseInt(gdate.getUTCMonth(), 10) + 1);
    var finalGMT = gdate.getUTCFullYear() + '-' + (parseInt(gdate.getUTCMonth(), 10) + 1) + '-' + gdate.getUTCDate() + ' ' + gdate.getUTCHours() + ':' + gdate.getUTCMinutes();
    return finalGMT;
}

exports.DaysBetweenDates = function(startDate, endDate) {
    var now = startDate, dates = [];
    
   while (now.isSameOrBefore(endDate)) {
          dates.push(now.format('YYYY-MM-DD'));
          now.add(1, 'days');
      }
    return dates;
};

exports.getDatesCount = function(dateArray) {
    var a = dateArray.reduce(function (acc, curr) {
        // console.log(acc);
    if (typeof acc[curr] == 'undefined') {
        acc[curr] = 1;
    } else {
        acc[curr] += 1;
    }

    return acc;
    }, {});
    return a;
};


exports.convertSecs = function(startDate, endDate)
{
    // console.log(startDate + ' - ' + endDate);
    var start_date = moment(startDate, 'YYYY-MM-DD HH:mm:ss');
    var end_date = moment(endDate, 'YYYY-MM-DD HH:mm:ss');
    // console.log(start_date + ' - ' + end_date);
    var duration = moment.duration(end_date.diff(start_date));
    var secs = duration.asSeconds();       
    return secs;
}

exports.secondsToHms = function (d, ind ="") {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
    // var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    // return hDisplay + mDisplay + sDisplay; 
    
    if(ind == 1)
    {   
        if(h > 24)
        {
            const days = Math.floor(d / (3600 * 24));
            return days == 1 ? days + " day " : days + " days ";
        }
        else
        {
            return hDisplay + mDisplay;
        }
    } 
    else
    {
        return hDisplay + mDisplay;
    }
    
    
}

exports.get_fulladdress = function (lat, lng) {
    con.connect(function (err, client, done) {
        if(err)
        {
           console.log(err); 
        }
        var addr;
        console.log(lat + ' - ' + lng);
        client.query("select latlong_id, latlong_lattitude, latlong_longitude, latlong_address, latlong_city, latlong_state, latlong_dist, latlong_country, latlong_zip from latlong_table where latlong_lattitude = '"+lat+"' AND latlong_longitude = '"+lng+"'", function(err, result3) 
        {
            if(err)
            {
                //console.log(err);
            }
            if(result3.rows.length > 0)
            {
                console.log("g1" + result3.rows[0]['latlong_address']);
                addr = result3.rows[0]['latlong_address'];
                 return addr;
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
                        console.log("g2" + result4.rows[0]['latlong_address']);
                        addr = result4.rows[0]['latlong_address'];
                        return addr;
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
                                console.log("g3" + res[0]['formattedAddress']);
                                addr = res[0]['formattedAddress'];
                                return addr;
                            }
                            
                        }); 
                    }
                });
            }
        });
    });
};
