const Http = new XMLHttpRequest();
const url='127.0.0.1';
Http.open('GET', url);
Http.send();

Http.onreadystatechange = (e) => {
    console.log(Http.responseText)
};