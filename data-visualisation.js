//run serveur : python -m http.server 8080

// Finition de la construction du HTML/CSS
var mediaQuery = window.matchMedia('(max-width: 1200px)');

function modificationTaille(e) {
  // Check if the media query is true
  if (e.matches) {
    columns = document.getElementsByClassName("column");
    for(col in columns){
      if (columns.hasOwnProperty(col)) {
        columns[col].style.width = "100%";
      }
    }
  }else{
    columns = document.getElementsByClassName("column");
    for(col in columns){
      if (columns.hasOwnProperty(col)) {
        columns[col].style.width = "50%";
      }
    }
  }
}
mediaQuery.addListener(modificationTaille)
modificationTaille(mediaQuery)


select_data_from = function(select){var s = document.getElementById(select); return s.options[s.selectedIndex].text}
getDataEntryFrom = function(select){return document.getElementById(select).value}
getChecked = function(select){return document.getElementById(select).checked}
parseTime = d3.timeParse("%b %Y")

function load_data(link){
  data = d3.csv(link, d => {
    for(subD in d){
      if(!isNaN(d[subD])){// Si c'est un nombre, on fait une conversion
        d[subD] = +d[subD];
      }else{
        is_time = false
        try{
          testTime = parseTime(d[subD]);
          if(testTime != null){
            is_time = true;
          }          
        }catch{
          is_time = false;
        }
        if(is_time){
          d[subD] = parseTime(d[subD]);
        }
      }
    }
    return d;
  });
  return data
}

function supChangeOption(){
  parseTime = d3.timeParse(getDataEntryFrom("timeParseEntry"));
  data = load_data(getDataEntryFrom("dataEntry"));
  construct_interface();
  changeOption();
}

function changeOption(){
  construct_graph();
}

function construct_interface(){

  document.getElementById('parametreDataDependant').innerHTML = "<p>Sélection de l'axe x : <select id='select_x' class='recharge'></select>Afficher le 0 : <input id='zero_x' class='recharge' type='checkbox'></input>L'axe x est temporel ? <select id='select_xt' class='recharge'><option value='Auto'>Auto</option><option value='Oui'>Oui</option><option value='Non'>Non</option></select></p><p>Sélection de l'axe y : <select id='select_y' class='recharge'></select>Afficher le 0 : <input id='zero_y' class='recharge' type='checkbox'></input></p><p>Sélection de la catégorie : <select id='select_c' class='recharge'></select></p>";

  data.then(function(data){
    var columns = (data.columns);
    var cc = document.createElement("option");
    cc.value = -1;
    cc.text = "Rien";
    document.getElementById("select_c").options.add(cc);
    for(let i = 0 ; i < columns.length ; i ++){
        var cx = document.createElement("option");
        cx.value = i;
        cx.text = columns[i];
        document.getElementById("select_x").options.add(cx);

        var cy = document.createElement("option");
        cy.value = i;
        cy.text = columns[i];
        document.getElementById("select_y").options.add(cy);

        var cc = document.createElement("option");
        cc.value = i;
        cc.text = columns[i];
        document.getElementById("select_c").options.add(cc);
    }
    document.getElementById("select_x").value = 1;
    document.getElementById("select_y").value = 2;
    document.getElementById("select_c").value = -1;

    elmRecharge = document.getElementsByClassName("recharge");
    for(let i = 0; i < elmRecharge.length ; i ++){
      elmRecharge[i].onchange = changeOption;
    }

    elmReRecharge = document.getElementsByClassName("rerecharge");
    for(let i = 0; i < elmReRecharge.length ; i ++){
      elmReRecharge[i].onchange = supChangeOption;
    }


  });
}

function construct_graph(scale={minX:null,maxX:null,minY:null,maxY:null}){
  data.then(function(data){

    x_cat = select_data_from("select_x");
    x_is_time = select_data_from("select_xt");
    y_cat = select_data_from("select_y");
    c_cat = select_data_from("select_c");

    if(x_is_time == "Auto"){
      try{
        data[0][x_cat].getFullYear();
        x_is_time = "Oui";
      }catch{
        x_is_time = "Non";
      }
    }

    categories = Array.from(new Set(data.map(d => d[c_cat])))
  
    data_agg = Array.from(d3.rollup(data, v => d3.mean(v, v => v[y_cat]), v => v[c_cat]))
                .map(d => {var rep = {}; rep[c_cat] = d[0]; rep[y_cat] = d[1];
                    return rep;  
                });
    
    getDataAgg = function(){
      if(x_is_time == "Oui"){
        return Array.from(d3.rollup(data, v => d3.mean(v, v => v[y_cat]), v => v[x_cat].getFullYear())).map(d => {var rep = {}; rep[x_cat] = d[0]; rep[y_cat] = d[1];return rep;});
      }else{
        return Array.from(d3.rollup(data, v => d3.mean(v, v => v[y_cat]), v => v[x_cat])).map(d => {var rep = {}; rep[x_cat] = d[0]; rep[y_cat] = d[1];return rep;});
      }
    }
    data_agg_temp =  getDataAgg();
  
    data_sort_by_cat = function(){var data_sort_by_cat = [];
        for(var i = 0; i < categories.length ; i ++){
            data_sort_by_cat[i] = data.filter(d => d[c_cat] == categories[i]);
        } return data_sort_by_cat}();
    
    
    document.getElementById("plot").style.width = getDataEntryFrom("widthEntry");
    var mediaQuery = window.matchMedia('(max-width: '+(parseInt(getDataEntryFrom("widthEntry"))*2).toString()+'px)');
    modificationTaille(mediaQuery);
    
    var parametres = {margin : ({top: parseInt(getDataEntryFrom("marginHEntry")), right: parseInt(getDataEntryFrom("marginDEntry")), bottom: parseInt(getDataEntryFrom("marginBEntry")), left: parseInt(getDataEntryFrom("marginGEntry"))}),
                      width: parseInt(getDataEntryFrom("widthEntry")),
                      height: parseInt(getDataEntryFrom("heightEntry")),
                      x_cat:x_cat,
                      y_cat:y_cat,
                      c_cat:c_cat,
                      color_cat:c_cat,
                      show_zero_x:getChecked("zero_x"),
                      show_zero_y:getChecked("zero_y"),
                      x_is_time:(x_is_time == "Oui"),
                      plot_type:select_data_from("select_g"),
                      scale:scale
    };

    plot = null
    if (parametres.plot_type == ("Line Chart")){
      plot = line_chart(data,categories,parametres);
    }else if(parametres.plot_type == "Scatter Plot"){
      plot = scatter_plot(data,parametres);
    }else if(parametres.plot_type == "Bar Chart"){
      plot = bar_chart(data_agg,parametres);
    }else{
      const svg = d3.create("svg").attr("width",parametres.width).attr("height",parametres.height);
      svg.append("text")
        .attr("x", 0)
        .attr("y", 100)
        .text("Pas de graphique correspondant")
      plot = svg.node()
    }

    if(plot != null){
      const plotPlace = document.getElementById("plot");
      if(plotPlace.childNodes.length > 0){
        plotPlace.removeChild(plotPlace.firstChild);
      }
      plotPlace.appendChild(plot);
    }

  });
}

function create_axes(svg,data,p){
  if(p.scale.minX == null){
    p.scale.minX = 0;
    if (p.show_zero_x == false){
      p.scale.minX = d3.min(data, d => {return d[p.x_cat];});
    }
  }
  if(p.scale.maxX == null){
    p.scale.maxX = d3.max(data, d => {return d[p.x_cat];});
    if (p.show_zero_x){
      p.scale.maxX = Math.max(0,p.scale.maxX);
    }
  }
  if(p.scale.minY == null){
    p.scale.minY = 0;
    if (p.show_zero_y == false){
      p.scale.minY = d3.min(data, d => {return d[p.y_cat];});
    }
  }
  if(p.scale.maxY == null){
    p.scale.maxY = d3.max(data, d => {return d[p.y_cat];});
    if (p.show_zero_y){
      p.scale.maxY = Math.max(0,p.scale.maxY);
    }
  }
  define_x = function(){
    if(p.plot_type == "Bar Chart"){
      return d3.scaleBand().domain(d3.range(data.length)).range([p.margin.left, p.width - p.margin.right]);
    }else{
      return p.x_is_time ? d3.scaleTime().domain([p.scale.minX,p.scale.maxX]).range([p.margin.left,p.width-p.margin.right]) : d3.scaleLinear().domain([p.scale.minX,p.scale.maxX]).range([p.margin.left,p.width-p.margin.right])
    }
  };
  const x = define_x();

  const y = d3.scaleLinear()
    .domain([p.scale.minY,p.scale.maxY])
    .range([p.height-p.margin.bottom,p.margin.top]);

  var colorRange = d3.schemeCategory10;
  if (p.color_cat == null || p.color_cat == "Rien"){
    colorRange = ["black"];
  }
  const c = d3.scaleOrdinal()
              .domain(Array.from(new Set(data.map(d=>d[p.color_cat]))))
              .range(colorRange);
  const xAxis = g => g.attr("transform", `translate(0,${p.height - p.margin.bottom})`).call(d3.axisBottom(x));
  const yAxis = g => g.attr("transform", `translate(${ p.margin.left},0)`).call(d3.axisLeft(y));
  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);
  svg.append("text")
    .attr("x", 0)//p.margin.left
    .attr("y", 10)
    .text(p.y_cat.replace("_"," "))

  svg.append("text")
    .attr("x", p.width-p.margin.right + 5)
    .attr("y", p.height - p.margin.bottom + 5)
    .text(p.x_cat.replace("_"," "))

  return {x:x,y:y,c:c,minX:p.scale.minX,maxX:p.scale.maxX,xAxis:xAxis,yAxis:yAxis};
}

function create_legend(svg,c,p){
  if(p.c_cat != "Rien"){
    const legend = svg.append("g") // créattion élt différent de la racine
    
    legend.selectAll("rect")
      .data(categories)
      .enter()
      .append("rect")
      .attr("x", p.width + 20 - p.margin.right)
      .attr("y", (d, i) => (i+1)*20)
      .attr("height", 15)
      .attr("width", 15)
      .attr("fill", d => c(d))
    
    legend.selectAll("text")
      .data(categories)
      .enter()
      .append("text")
      .attr("x", p.width + 40 - p.margin.right)
      .attr("y", (d, i) => (i+1)*20 +10)
      .attr("height", 15)
      .attr("width", 15)
      .text(d => d)
  }
}

scatter_plot = function(data,p){
    const svg = d3.create("svg").attr("width",p.width).attr("height",p.height);//.attr("viewBox",[0,0,width,height]);
    
    // Création des axes
    axes = create_axes(svg,data,p)

    // Add brushing
    // var brush = d3.brush()                 // Add the brush feature using the d3.brush function
    //   .extent( [ [p.margin.left,p.margin.top], [p.width-p.margin.right,p.height-p.margin.bottom] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    //   .on("end", e=>{updateChart(e)}) // Each time the brush selection changes, trigger the 'updateChart' function

    var scatter = svg.append('g')
      .attr("clip-path", "url(#clip)")
    
    scatter.selectAll("circle")
      .data(data)
      .enter() // permet d'avoir un sous ensemble de ces placeholders
      .append("circle")
      .attr("cx", d => { if(axes.x(d[p.x_cat]) >= p.margin.left && axes.x(d[p.x_cat]) <= p.width-p.margin.right){return axes.x(d[p.x_cat]);} else {return -10}})
      .attr("cy", d => { if(axes.y(d[p.y_cat]) >= p.margin.top && axes.y(d[p.y_cat]) <= p.height-p.margin.bottom){return axes.y(d[p.y_cat]);}else {return -10}})
      .attr("r",Math.min(p.width,p.height)/200)
      .attr("fill", d => { return axes.c(d[p.c_cat]);})
      
    // scatter
    //   .append("g")
    //   .attr("class", "brush")
    //   .call(brush);

    //Legende
    create_legend(svg,axes.c,p);

    // function xG_to_xL(xG){
    //   return (p.scale.maxX-p.scale.minX)*(xG-p.margin.left)/(p.width-p.margin.right-p.margin.left)+p.scale.minX;
    // }
    // function yG_to_yL(yG){
    //   return (p.scale.maxY-p.scale.minY)*(yG-(p.height-p.margin.bottom))/(p.margin.top-(p.height-p.margin.bottom))+p.scale.minY;
    // }
    
    // function invertSelection(sel){
    //   xmi = sel[0][0];
    //   ymi = sel[0][1];
    //   xma = sel[1][0];
    //   yma = sel[1][1]; 
    //   return [[ xG_to_xL(xmi),yG_to_yL(ymi)],[ xG_to_xL(xma),yG_to_yL(yma)]];
    // }

    // function updateChart(event) {
    //   newSelection = invertSelection(event.selection);
    //   construct_graph(scale={minX:newSelection[0][0],maxX:newSelection[1][0],minY:newSelection[1][1],maxY:newSelection[0][1]});
    // }

    return svg.node();
}

line_chart = function(data,categories,p){
  // Initialisation du svg
  const svg = d3.create("svg").attr("width",p.width).attr("height",p.height);

  //Création des axes
  axes = create_axes(svg,data,p);


  //Placement des points
  svg.selectAll("circle")
    .data(data)
    .enter() // permet d'avoir un sous ensemble de ces placeholders
    .append("circle")
    .attr("cx", d => { return axes.x(d[p.x_cat]);})
    .attr("cy", d => { return axes.y(d[p.y_cat]);})
    .attr("r",Math.min(p.width,p.height)/200)
    .attr("fill", d => { return axes.c(d[p.color_cat]);})

  //Placement des lignes
  const line = d3.line()
    .x(d => axes.x(d[p.x_cat]))
    .y(d => axes.y(d[p.y_cat]))
  var data_sort_by_cat = [[],[]]
  for(var i = 0; i < categories.length ; i ++){
    data_sort_by_cat[i+2] = data.filter(d => d[p.color_cat] == categories[i]);
  }
  console.log(data_sort_by_cat)
  svg.selectAll("path")
    .data(data_sort_by_cat)
    .enter()
    .append("path")
    .attr("d", d => {return line(d);})
    .attr("stroke", (d,i) => {return axes.c(d[i][p.color_cat]);})
    .attr("fill", "none")

  //Legende
  create_legend(svg,axes.c,p);
  
  return svg.node();
}

bar_chart = function(data,p) {

  // Initialisation du svg
  const svg = d3.create("svg").attr("width", p.width).attr("height", p.height);

  // Création des axes
  axes = create_axes(svg,data,p)

  // --- Axis ---
  
  
  // Construction des rectangles
  svg.selectAll("rect") //tout elt créé est un cercle
    .data(data) //création d'autant d'object que d'elt dans la liste
    .enter() //
    .append("rect") //création du cercle
    .attr("x", (d, i) => axes.x(i) )
    .attr("y", d => { return  axes.y(d[p.y_cat]); })
    .attr("height", d => { return p.height - axes.y(d[p.y_cat]) - p.margin.bottom; })
    .attr("width", axes.x.bandwidth())
    .attr("fill", d => axes.c(d[p.c_cat]))
    .attr("opacity", .5)

  // Legende
  create_legend(svg,axes.c,p)
  
  return svg.node();
}

supChangeOption();

// bourse : https://gist.githubusercontent.com/romsson/f60995ae128cca7b4e19b95ff28a51ea/raw/813b393191ebcba927605f4dbc7656b119504e41/dataset.csv
// iris : https://romsson.github.io/visualisation-interactive/datasets/iris.csv

