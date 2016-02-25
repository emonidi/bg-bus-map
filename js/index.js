(function(){
  var mapDiv = d3.select('.map').node();
  var width = 1000;
  var height = 1000;

  var svg = d3.select(mapDiv).append('svg')
      .attr('width', width)
      .attr('height', height);

  var mapGroup = svg.append('g')
    .attr('width',width)
      .attr('height',height);

  d3.json('data/geo.json',function(data){

    var projection = d3.geo.mercator()
    .scale(7000)
    .translate([-2600, height*6.1 ])

    var path = d3.geo.path().projection(projection);
    var map = mapGroup.selectAll('path').data(data.features).enter()
      .append('path')
      .attr('d',path)
      .style({
        'fill':'steelblue',
        'stroke':'steelblue'
      });

      setStations(data,projection);

  });

  function setStations(geojson,projection){
    d3.json('data/processed-stations.json',function(data){
        appendStations(data,projection);
        setLines(data,projection);
    })
  }

  function appendStations(data,projection){
    var circleGroup = svg.append('g').attr('class','circle-group');
    circleGroup.selectAll('circle').data(data).enter()
        .append('circle')
        .attr('r',3)
        .attr('cx',function(d){
          return projection([d.coords.x, d.coords.y])[0]
        })
        .attr('cy',function(d){
          return projection([d.coords.x, d.coords.y])[1]
        });
  }

    function setLines(stations,projection){
        d3.json('data/processed-lines.json',function(data){
            var data = data.result.records;
            var data = data.filter(function(el,index,arr){
                if(index != 0 && el.name !== arr[index-1].name){
                    return el;
                }
            });

            var coords = createCoords(data,stations);

            var linesGroup = svg.append('g').attr('class','lines-group');

            linesGroup.selectAll('path').data(data)
                .enter()
                .append('path')
                .attr('d',function(d){
                  var start = removeSpaces(d.name.split('-')[0]);
                  var end = removeSpaces(d.name.split('-')[1]);
                    
                  if(coords[start] && coords[end]){
                    var startCoord = projection([coords[start].x,coords[start].y]);
                    var endCoord = projection([coords[end].x,coords[end].y]);
                    if(endCoord[0] > 1000 || endCoord[1] > 1000){
                      console.log(coords[start],end);
                    }
                    var string = 'M' + startCoord[0] + ',' + startCoord[1] + 'L' + endCoord[0] + ',' + endCoord[1];
                               
                 //   console.log(string);
                    return string;
                  }
                  
                })
                .style('stroke',"#333")
        });


    }


    function createCoords(lines,stations,callback){
        var coords = {};
        lines.forEach(function(line){
            var line = line.name.replace(new RegExp(/\s/ig),'');
            var start = line.split('-')[0];
            var end = line.split('-')[1];
            if(!coords[start]){
                coords[start] = findCoords(start,stations);
            }

            if(!coords[end]){
                coords[end] = findCoords(end,stations);
            }
        });

        return coords;

        function findCoords(town,stations){

            var coords;
            if(!town) return
            stations.forEach(function(station,index){


                if(station.town.replace(new RegExp(/\s/ig),'').toUpperCase() === town.replace(new RegExp(/\s/ig),'')){
                    coords =  station.coords
                }
            })

            return coords;
        }
    }

    function removeSpaces(string){
        return string.replace(new RegExp(/\s/ig),'');
    }

})();
