// Source: http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
var str;
var jsonObj;
Parse.initialize("", "");

function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp((
        // Delimiters.
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
        }
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"), "\"");
        } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }
    // Return the parsed data.
    return (arrData);
}

function CSV2JSON(csv) {
    console.log("converting to JSON");
    var array = CSVToArray(csv);
    var objArray = { "items":[{}] };
    for (var i = 1; i < array.length; i++) {
        objArray.items[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            var key = array[0][k];
            var data = array[i][k];
            if(key==="dob"){
                data = new randomDate(new Date(1940, 0, 1), new Date(2001, 0, 1));
            }
            objArray.items[i - 1][key] = data;
        }
    }

    jsonObj = objArray;
    var jsonStr = JSON.stringify(objArray);
    str = jsonStr.replace(/},/g, "},\r\n");
    return jsonStr;
}

function randomDate(begin, end){
    return new Date(begin.getTime() + Math.random() * (end.getTime() - begin.getTime()));
}

function signUpUserParse(){
    var data = $.parseJSON($("#json").val());

    $.each(data.items, function() {
        var user = new Parse.User();

        for(var key in this) {

            if(key ==="dob") { user.set("dob", new Date(this.dob)); }
            else if (key === "brandNumberOfShops") { user.set(key, parseInt(this[key],10)); }
            else if (key === "brandNumberOfStaff") { user.set(key, parseInt(this[key],10)); }
            else { user.set(key, this[key]); }
        }

        if($('#account-master').is(':checked')) {
            user.set("accountType", "master");
            user.set("brandAccountVerified", true);
            console.log("setting master");
        }
        else {
            user.set("accountType", "user");
            console.log("setting user");
        }

        user.signUp(null, {
            success: function(user) {
                console.log("Hooray!");
            },
            error: function(user, error) {
                // Show the error message somewhere and let the user try again.
                alert("Error: " + error.code + " " + error.message);
            }
        });
    });

}

function createCards(){
    var data = $.parseJSON($("#json").val());
    var Card = Parse.Object.extend("Card");

    var cardRewards = $.getJSON("data.json");;

    $.each(data.items, function() {
        //var card = new Card();
        var Card = Parse.Object.extend("Card");
        var query = new Parse.Query(Card);
        query.equalTo("name", this.rewards);
        query.first({
            success: function(card) {
                console.log("updating " + card.id)
                for (var cardObj in cardRewards.data) {
                    var obj = cardRewards.data[cardObj];
                    if(obj["name"] === card.get("name")) {
                        card.set("rewards", obj["rewards"]);
                    }
                }

                card.save(null, {
                    success: function(card) {
                        // The object was saved successfully.


                        console.log("card saved! :)")
                    },
                    error: function(card, error) {
                        // The save failed.
                        // error is a Parse.Error with an error code and description.
                    }
                });
            },
            error: function(object, error) {
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and description.
            }
        });

    });

}
