<script>
    import { onMount, beforeUpdate } from 'svelte';
    import { templateList } from '../stores/metadataStore';
    import { navigate } from 'svelte-routing';

    export let userdata = {};
    export let location = "";
    
    let options = [],
        copyInput,
        selectedTemplate,
        open = false;

    onMount(async () => {
        options = await templateList();

        if (userdata && userdata.template && options && options.length > 0) {
            let templateFound = options.filter(t => t.id === userdata.template);

            if (templateFound.length === 1)
                selectedTemplate = templateFound[0];
            else 
                selectedTemplate = options.filter(t => t.id === "s3-yellow-indigo")[0];
        } else {
            selectedTemplate = options.filter(t => t.id === "s3-yellow-indigo")[0];
        }

        jQuery("#save-form").on("submit", function() {
            jQuery("#submit").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Loading...');
        });
    });

    function loadTemplatePicker() {
        navigate("/templates");
    }

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

        if (userdata && userdata.template && options && options.length > 0) {
            let templateFound = options.filter(t => t.id === userdata.template);

            if (templateFound.length === 1)
                selectedTemplate = templateFound[0];
            else 
                selectedTemplate = options.filter(t => t.id === "s3-yellow-indigo")[0];
        } else {
            selectedTemplate = options.filter(t => t.id === "s3-yellow-indigo")[0];
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
                                <div class="col-12">
                                    <button type="button" on:click={loadTemplatePicker} style="width:100%" class="btn btn-primary">{selectedTemplate ? selectedTemplate.name : "Splatoon 3 Blue on Yellow"}</button>
                                    <input type="hidden" value={selectedTemplate ? selectedTemplate.id : "s3-yellow-indigo"} name="template" />
                                    {#if selectedTemplate}
                                    <img src={selectedTemplate.url} style="width:100%;" id="templateimage" alt="template"/>
                                    {/if}
                                </div>
                            </div>
                        </div>
                        <button id="submit" type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}
</div>