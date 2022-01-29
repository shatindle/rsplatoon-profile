<script>
    import { onMount, beforeUpdate } from 'svelte';
    import { templateList } from '../stores/metadataStore';

    export let userdata = {};
    export let location = "";
    
    let options = [],
        copyInput;

    onMount(async () => {
        options = await templateList();

        jQuery("#save-form").on("submit", function() {
            jQuery("#submit").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Loading...');
        });
    });

    function cleanFriendCode(current = "") {
        current = current.replace(/[^0-9]/g,'');

        let final = "";

        for (let i = 0; i < current.length; i++) {
            if (i === 12)
                break;

            if (i === 4 || i === 8)
                final += "-";

            final += current[i];
        }

        return final;
    }

    beforeUpdate(() => {
        userdata.friendCode = cleanFriendCode(userdata.friendCode);

        switch (userdata.template) {
            case "s3-agent3":
                userdata.image = "/css/img/canvas_s3_agent3.png";
                break;
            case "s3-marie":
                userdata.image = "/css/img/canvas_s3_marie.png";
                break;
            case "s2-chaos-order":
                userdata.image = "/css/img/canvas_s2_chaos_order.png";
                break;
            case "s2-order-chaos": 
                userdata.image = "/css/img/canvas_s2_order_chaos.png";
                break;
            case "s2-octavio":
                userdata.image = "/css/img/canvas_s2_octavio.png";
                break;
            case "user-coffee-squid": 
                userdata.image = "/css/img/canvas_user_coffee_squid.png";
                break;
            case "s2-black-firefin":
                userdata.image = "/css/img/canvas_s2_black_firefin.png";
                break;
            case "s2-toni-kensa-inverted":
                userdata.image = "/css/img/canvas_s2_toni_kensa_inverted.png";
                break;
            case "s2-toni-kensa":
                userdata.image = "/css/img/canvas_s2_toni_kensa.png";
                break;
            case "s1-blue-orange":
                userdata.image = "/css/img/canvas_s1_blue_orange.png";
                break;
            case "s1-orange-blue":
                userdata.image = "/css/img/canvas_s1_orange_blue.png";
                break;
            case "s2-pink-green":
                userdata.image = "/css/img/canvas_s2_pink_green.png";
                break;
            case "s2-green-pink":
                userdata.image = "/css/img/canvas_s2_green_pink.png";
                break;
            case "s3-indigo-yellow":
                userdata.image = "/css/img/canvas_s3_indigo_yellow.png";
                break;
            case "user-black-gold":
                userdata.image = "/css/img/canvas_user_black_gold.png";
                break;
            case "s3-callie":
                userdata.image = "/css/img/canvas_s3_callie.png";
                break;
            case "s2-sanitized-pink":
                userdata.image = "/css/img/canvas_s2_sanitized_pink.png";
                break;
            case "s3-yellow-indigo":
            default:
                userdata.image = "/css/img/canvas_s3_yellow_indigo.png";
                break;
        }
    });
    
    function copyToClipboard() {
        console.log("going");
        copyInput.focus();
        copyInput.select();
        document.execCommand("copy");
    }
</script>

<div>
{#if userdata.id}
    <div class="container">
        <div class="row" style="margin-bottom: 14px;">
            <div class="col">
                {#if userdata.profileId}
                    <form>
                        <label for="copy-input">Your Profile Link</label>
                        <div class="input-group" on:click={copyToClipboard}>
                                <input type="text" class="form-control"
                                    value="{userdata.baseUrl}/p/{userdata.profileId}?_v={new Date().valueOf()}" id="copy-input" bind:this={copyInput} readonly>
                                <span class="input-group-btn">
                                <button class="btn btn-default" type="button" id="copy-button"
                                    data-toggle="tooltip" data-placement="button"
                                    title="Copy to Clipboard">
                                        <i class="fa fa-copy"></i>
                                </button>
                                </span>
                        </div>
                    </form>
                {/if}
            </div>
        </div>
        <div class="row">
            <div class="col-12 col-md-6">
                {#if userdata.drip}
                    <div>
                        <h3>Your drip</h3>
                        <a class="btn btn-primary edit-drip" href="/drip" role="button">Edit</a>
                    </div>
                    <img src={userdata.drip} class="drip-pic" alt="drip" />
                {:else}
                    <div>
                        <h3>No drip</h3>
                        <a class="btn btn-primary edit-drip" href="/drip" role="button">Edit</a>
                    </div>
                    <img src="/css/img/nodrip.png" class="drip-pic" alt="drip" />
                {/if}
            </div>
            <div class="col-12 col-md-6">
                <form action="/api/save" method="post" id="save-form">
                    <div class="form-group">
                        <h3 for="name">Username</h3>
                        <input type="text" class="form-control" name="name" bind:value={userdata.name} id="name" placeholder="In game name" maxlength="10" />
                        
                        <h3 for="friendcode">Friend Code</h3>
                        <input type="text" class="form-control" name="friendcode" bind:value={userdata.friendCode} id="friendcode" placeholder="0000-0000-0000" />
                        
                        <div class="">
                            <div class="row">
                                <div class="col">
                                    <h3 for="template">Card Template</h3>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12 col-md-6">
                                    {#if options.length > 0}
                                    <select class="form-control" name="template" bind:value="{userdata.template}">
                                        {#each options as option}
                                        <option value={option.value}>{option.name}</option>
                                        {/each}
                                    </select>
                                    {/if}
                                </div>
                                <div class="col-12 col-md-6">
                                    <img src={userdata.image} style="width:100%;" id="templateimage" alt="template"/>
                                </div>
                            </div>
                        </div>

                        <button id="submit" type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{:else}
    <div class="nameentry needtologin">
        <a id="loginDiscord" href={userdata.loginUrl}>
            <button class="btn btn-primary" type="button">Discord Login</button>
        </a>
    </div>
{/if}
</div>