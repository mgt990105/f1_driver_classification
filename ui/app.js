Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });
    
    dz.on("addedfile", function() {
        if (dz.files[1]!=null) {
            dz.removeFile(dz.files[0]);        
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;
        
        
        // var url = "http://127.0.0.1:5001/classify_image";
        var url = "/api/classify_image"

        $.post(url, {
            image_data: file.dataURL
        },function(data, status) {

            console.log(data);
            if (!data || data.length==0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();                
                $("#error").show();
                return;
            }

            let players = ["alex albon", "carlos sainz", "charles leclerc", "daniel ricciardo", "esteban ocon", "fernando alonso", 
            "george russell", "kevin magnussen", "lance stroll", "lando norris", "lewis hamilton", "logan sargeant", "max verstappen", "nico hulkenberg", 
            "oscar piastri", "pierre gasly", "sergio perez", "valtteri bottas", "yuki tsunoda", "zhou guanyu"];
            
            let match = null;
            let bestScore = -1;
            for (let i=0;i<data.length;++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if(maxScoreForThisClass>bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }
            if (match) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();
                $("#resultHolder").html($(`[data-player="${match.class}"`).html());

                let capitalizeEachWord = (string) => {
                    return string.replace(/\b\w/g, (char) => char.toUpperCase());
                  };

                let resultText = `You resemble ${capitalizeEachWord(match.class)}! There's a ${bestScore}% chance you could be mistaken for him on the track! ;)`;
                $("#resultHolder").append(`<div class="result__text" id="resultText">${resultText}</div>`);

                let classDictionary = match.class_dictionary;
                for(let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let proabilityScore = match.class_probability[index];
                    let elementName = "#score_" + personName;
                    $(elementName).html(proabilityScore);
                }
            }
            // dz.removeFile(file);            
        });
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log( "ready!" );
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    init();
});