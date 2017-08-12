<template>
    <div class="panel panel-default">
        <div class="panel-heading">Example Component</div>

        <div class="panel-body">
            I'm an example component!
        </div>
    </div>
</template>

<script>
    export default {
        mounted() {
            console.log('Example Mounted...');
            axios.get('/api/user')
                .then(response => {
                    console.log(response.data);
                });
            // var xhttp = new XMLHttpRequest();
            // xhttp.onreadystatechange = function() {
            //     if (this.readyState == 4 && this.status == 200) {
            //         console.log(this.responseText);
            //     }
            // };
            // xhttp.open("GET", "/api/election", true);
            // xhttp.responseType = 'json';
            // xhttp.setRequestHeader('Accept', 'application/json');
            // xhttp.send();
        }
    }
</script>
