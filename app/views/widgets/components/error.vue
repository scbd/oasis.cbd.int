<template>
    <div class="v-text-field__details">
        <div class="v-messages theme--light error--text"
            role="alert">
            <div class="v-messages__wrapper">
            <div class="v-messages__message">
                <span>{{errorMessage}}</span>
            </div>
            </div>
        </div>
    </div>
</template>
<script>

    define(['Vue',], function(Vue) {
        
        return{
            template:template,
            props:["errorMessage"],
        }
        
    });

</script>