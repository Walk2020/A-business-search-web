var tableData = "";
var sortDirectionName = false;
var sortDirectionRating = false;
var sortDirectionDistance = false;



function disableLocation(){
  if (document.getElementById("autoLocation").checked){
    document.getElementById("location").value=""; 
    document.getElementById("location").disabled = true; 
  }
  else{
    document.getElementById("location").disabled = false; 
  }
}

function resetWeb(){
  document.getElementById("keyword").value = "";
  document.getElementById("distance").value = 10;
  document.getElementById("category").selectedIndex = 0;
  document.getElementById("location").disabled = false;
  document.getElementById("location").value = "";
  document.getElementById("autoLocation").checked = false;
  document.getElementById("table_data").innerHTML = '';
  document.getElementById("result_table").style.display = "none";
  tableData = "";
  document.getElementById("info_card_container").style.display = "none";
  document.getElementById("result_no_matching").style.display = "none";
  window.location.hash = '#whole_page';

}


async function setRequest (){
  document.getElementById("result_no_matching").style.display = "none";
  document.getElementById("result_table").style.display = "none";
  tableData = "";
  document.getElementById("info_card_container").style.display = "none";

  if(!(document.getElementById("myForm").checkValidity())){
    return;
  }

  var lat = "";
  var lng = "";
  var distance = document.getElementById("distance").value;
  distance = Math.round(distance * 1609.344);
  var category = document.getElementById("category").value;
  var keyword = document.getElementById("keyword").value;
  var formLocation = document.getElementById("location").value;
  //var url = "https://python-project-hw6673.wl.r.appspot.com";
  var url = window.location.href.split('#')[0];
  var ipToken = "257935eef18f23";
  var geoKey = "AIzaSyCKjFH0ANZp2b8Fraew3lyLA4mdUT2YYyA"


  if(document.getElementById("autoLocation").checked){ 
    // get lat and lng from IP
    let response = await fetch("https://ipinfo.io/?token=" + ipToken);
    let data = await response.json();
    locArray = data.loc.split(","); 
    lat = locArray[0];
    lng = locArray[1];   
  }
  else{
    // get lat and lng from google
    let response = await fetch("https://maps.googleapis.com/maps/api/geocode/json?address="+formLocation+"&key="+geoKey);
    if(response.status == 200){
      document.getElementById("result_no_matching").style.display = "flex";
      return;
    }
    let data = await response.json();
    lat = data.results[0].geometry.location.lat;
    lng = data.results[0].geometry.location.lng;
  }
  

  //generate standard url
  url = url + "form" + "?lat=" + lat + "&lng=" + lng + "&keyword=" + keyword + "&category=" + category + "&distance=" + distance; 

  let rsp = await fetch(url);
  tableData = await rsp.json();
  tableData = tableData.businesses;
  if(tableData=="" || tableData == null){
    document.getElementById("result_no_matching").style.display = "flex";
  }
  else{
    generateTable();
    window.location.hash = '#result_table_container';
  }
}

function generateTable(){ 
  document.getElementById("result_table").style.display = "table";
  let dataHtml='';
  let index = 0;
  for(let result of tableData){
    index++;
    var img_url="";
    var distance_miles = result.distance/1609.344;
    distance_miles = distance_miles.toFixed(2);
    if(result.image_url == null || result.image_url == ""){
      img_url = "static/yelp_icon.jpg"
    }
    else{
      img_url = result.image_url;
    }

    dataHtml = dataHtml + `<tr><td>${index}</td><td><img src=${img_url}></td> <td><a href="#info_card" onclick='getDetailInfo("${result.id}")'>${result.name}</a></td><td>${result.rating}</td><td>${distance_miles}</td></tr>`
  }
  document.getElementById("table_data").innerHTML = dataHtml;
}

function sortColumn(columnName){
  let sortDirectionNumber;
  switch(columnName){
    case 'name':
      sortDirectionName = !sortDirectionName;
      break;

    case 'rating':
      sortDirectionRating = !sortDirectionRating;
      sortDirectionNumber = sortDirectionRating;
      break;
    
    case 'distance':
      sortDirectionDistance = !sortDirectionDistance;
      sortDirectionNumber = sortDirectionDistance;
      break; 
  }

  const dataType = typeof tableData[0][columnName];

  switch(dataType){
    case 'number':
      sortNumberColumn(sortDirectionNumber, columnName);
      break;
    
    case 'string':
      sortNameColumn(sortDirectionName, columnName);
      break;

    

  }

  generateTable();
}

function sortNumberColumn(sort, columnName){
  tableData = tableData.sort(function(r1, r2){
    if(sort){
      return r1[columnName] - r2[columnName];
    }
    else{
      return r2[columnName] - r1[columnName];
    }
  });
}

function sortNameColumn(sort, columnName){
  tableData = tableData.sort(function(r1, r2){
    if(sort){
      if(r1[columnName] > r2[columnName]){ return 1;}
      if(r1[columnName] < r2[columnName]){ return -1;}
      return 0;
    }
    else{
      if(r1[columnName] < r2[columnName]){ return 1;}
      if(r1[columnName] > r2[columnName]){ return -1;}
      return 0;
    }
  });
}


async function getDetailInfo(businessesId){
  //generate detail request url
  var url = window.location.href.split('#')[0];
  //var url = "https://python-project-hw6673.wl.r.appspot.com";
  url = url + "detail" + "?id=" + businessesId;
  var rsp = await fetch(url);
  var detail = await rsp.json();

  window.location.hash = '#info_card_container';

  document.getElementById("info_card_container").style.display = "flex";

  // change table display back!!!!!!!!!!
  if(detail.name == null || detail.name == ""){
    document.getElementById("info_card_name").style.visibility = "hidden";
  }
  else{
    document.getElementById("info_card_name").style.visibility = "visible";
    document.getElementById("info_card_name").innerHTML=detail.name;
  }
  
  if(detail.hours[0].is_open_now){
    document.getElementById("status_info").innerHTML = "Open Now";
    document.getElementById("status_info").style.width= "120px";
    document.getElementById("status_info").style.backgroundColor = "green";
  }
  else{
    document.getElementById("status_info").innerHTML = "Closed";
    document.getElementById("status_info").style.width= "80px";
    document.getElementById("status_info").style.backgroundColor = "red";
  }

  if(detail.categories == null || detail.categories == ""){
    document.getElementById("category_container").style.visibility = "hidden";
  }
  else{
    document.getElementById("category_container").style.visibility = "visible";
    var category_info = detail.categories[0].title;
    for(var index = 1; index < detail.categories.length; index++){
      category_info = category_info + " | " + detail.categories[index].title;
    }
    document.getElementById("category_info").innerHTML = category_info;
  }

  if(detail.location.display_address == null || detail.location.display_address == ""){
    document.getElementById("address_container").style.visibility = "hidden";
  }
  else{
    document.getElementById("address_container").style.visibility = "visible";
    var address  = detail.location.display_address[0];
    for(var index = 1; index < detail.location.display_address.length; index++){
      address = address + ", " + detail.location.display_address[index];
    }
    document.getElementById("address_info").innerHTML = address;
  }

  if(detail.display_phone == null || detail.display_phone == ""){
    document.getElementById("phone_container").style.visibility = "hidden";
  }
  else{
    document.getElementById("phone_container").style.visibility = "visible";
    document.getElementById("phone_info").innerHTML = detail.display_phone;
  }

  if(detail.transactions == null || detail.transactions == ""){
    document.getElementById("transaction_container").style.visibility = "hidden";
  }
  else{
    document.getElementById("transaction_container").style.visibility = "visible";
    var transaction_support = detail.transactions[0];
    for(var index = 1; index < detail.transactions.length; index++){
      transaction_support = transaction_support + " | " + detail.transactions[index];
    }
    document.getElementById("transaction_info").innerHTML = transaction_support;
  }

  if(detail.price == null || detail.price == ""){
    document.getElementById("price_container").style.visibility = "hidden";
  }
  else{
    document.getElementById("price_container").style.visibility = "visible";
    document.getElementById("price_info").innerHTML = detail.price;
  }

  if(detail.url == null || detail.url == ""){
    document.getElementById("more_info_container").style.visibility = "hidden";
  }
  else{
    document.getElementById("more_info_container").style.visibility = "visible";
    document.getElementById("yelp_link").href = detail.url;
    document.getElementById("yelp_link").target = "_blank";
  }

  if(detail.photos == null || detail.photos == ""){
    document.getElementById("pictures_container").style.visibility = "hidden";
  }
  else{
    document.getElementById("pictures_container").style.visibility = "visible";
    for(let index = 0; index < detail.photos.length; index++){
      var img_id = "img" + index;
      document.getElementById(img_id).src = detail.photos[index];
    }
  }





}



