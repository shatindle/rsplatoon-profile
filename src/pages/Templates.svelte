<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { searchTemplates, deleteTemplate } from '../stores/templateStore';
    import Fuse from 'fuse.js'

    /* Ratio to get font size in resized template preview.
     * Determined from template width / font size in server/dal/cardApi.js
     */
    const PREVIEW_FONT_RATIO = 21.891;

    export let userdata = {};
    export let setTemplate = (template) => {};
    let templates = null;
    let justMyTemplates = false;
    let filteredTemplates = null;
    let fuse;
    let search = '';
    let unusedSlot = 0;
    let templateWidth = 0;
    let previewFontSize = 0;

    onMount(async () => {
        templates = await searchTemplates();
        templates = templates.sort((t1, t2) => {
            if (t1.userId === userdata.id && t2.userId === userdata.id)
                return 0;

            if (t1.userId !== userdata.id && t2.userId !== userdata.id)
                return 0;

            if (t1.userId === userdata.id)
                return -1;

            return 1;
        })
        filteredTemplates = templates;

        const options = {
            shouldSort: true,
            threshold: 0.4,
            keys: [
                "name",
                "keywords"
            ]
        };

        fuse = new Fuse(templates, options);

        let sorted = templates.filter(t => t.userId === userdata.id).sort((t1, t2) => parseInt(t1.slot) > parseInt(t2.slot) ? 1 : -1);

        sorted.forEach(t => unusedSlot === parseInt(t.slot) && unusedSlot++);
    });

    function filterTemplates() {
        if (search)
            filteredTemplates = fuse.search(search).map(v => v.item);
        else
            filteredTemplates = templates;
    }

    function clickTemplate(id) {
        setTemplate(id);
        navigate("/");
    }

    async function confirmDelete(name, slot) {
        const result = confirm(`Are you sure you wish to delete the template ${name}?  This action cannot be undone.`);

        if (result) {
            await deleteTemplate(slot);

            window.location.reload();
        }
    }

    $: previewFontSize = templateWidth / PREVIEW_FONT_RATIO;
</script>

{#if userdata}
<div class="container">
    {#if templates && templates.filter(t => t.userId === userdata.id).length < 10}
    <div class="row">
        <div class="col">
            <h3>Create a template</h3>
            <form action="/api/templates/save" method="post" enctype='multipart/form-data'>
                <div class="row">
                    <div class="col-12 col-md-4">
                        <label for="name">Name</label>
                        <input type="text" class="form-control" name="name" maxlength="20" />
                    </div>
                    <div class="col-12 col-md-8">
                        <label for="name">Search Terms</label>
                        <input type="text" class="form-control" name="searchTerms" maxlength="70" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 col-md-6">
                        <label for="name">Friend Code Color</label>
                        <input type="color" class="form-control" name="friendcodecolor" />
                    </div>
                    <div class="col-12 col-md-6">
                        <label for="name">Name Color</label>
                        <input type="color" class="form-control" name="namecolor" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 col-md-6">
                        <label for="img">Template</label>
                        <div>
                            <input type="file" name="img" />
                        </div>
                    </div>
                    <div class="col-12 col-md-6" style="position:relative;">
                        <div class="save-new">
                            <button type="submit" class="btn btn-primary">Save</button>
                        </div>
                    </div>
                </div>
                <input type="hidden" name="slot" value={unusedSlot} />
            </form>
        </div>
    </div>
    {/if}
    <div class="row" style="margin-top: 14px;">
        <div class="col">
            <h3>Pick a Template</h3>
            <div class="row no-gutters">
                <div class="col">
                    <label class="checkbox-container">Just my templates
                        <input type="checkbox" bind:checked={justMyTemplates} />
                        <span class="checkmark"></span>
                    </label>
                </div>
            </div>
            <div class="row no-gutters">
                <div class="col">
                    <label for="search">Search</label>
                    <input type="text" class="form-control" bind:value={search} on:input={filterTemplates} />
                </div>
            </div>
            <div class="row no-gutters" style="margin-top: 10px;">
                {#if templates}
                {#each filteredTemplates.filter(t => justMyTemplates ? t.userId === userdata.id : true) as template, i}
                <div class="col-12 col-md-4" style="position:relative;">
                    <div class="floating-card mdc-elevation--z8">
                        <div class="row no-gutters" style="margin-left: 8px; margin-top: 4px;">
                            <div class="col-12 no-gutters">
                                <h5>{template.name}</h5>
                            </div>
                        </div>
                        <button type="btn btn-primary" class="template-choice" on:click={() => clickTemplate(template.id)}>
                            <div class="card-preview">
                                {#if i === 0}
                                <div bind:clientWidth={templateWidth}>
                                    <img src={template.url} alt="template" style="width:100%;"/>
                                </div>
                                {:else}
                                <img src={template.url} alt="template" style="width:100%;"/>
                                {/if}
                                <div class="card-text" style="color:{template.color_friendcode};top:11.5%; font-size: {previewFontSize}px;">
                                    0000-0000-0000
                                </div>
                                <div class="card-text" style="color:{template.color_name};top:26.7%; font-size: {previewFontSize}px;">
                                    Example
                                </div>
                            </div>
                            <div class="search-terms">
                                {#each template.keywords.split(' ') as keyword}
                                {#if keyword}
                                <div class="term">{keyword}</div>
                                {/if}
                                {/each}
                            </div>
                        </button>
                        {#if template.userId === userdata.id}
                        <div class="row">
                            <div class="col" style="position:relative;margin:12px;">
                                <button type="button" class="btn btn-danger" style="width:100%;" on:click={async () => await confirmDelete(template.name, template.slot)}>Delete</button>
                            </div>
                        </div>
                        {/if}
                    </div>
                </div>
                {/each}
                {:else}
                <div class="col">
                    You don't have any templates
                </div>
                {/if}
            </div>
        </div>
    </div>
</div>
{/if}

<style>
    .save-new {
        position:absolute;
        bottom:0;
        right:14px;
    }

    .search-terms {
        width: 100%;
    }

    .term {
        background-color: #ccc;
        padding: 2px 4px;
        border-radius: 4px;
        display: inline-block;
        margin: 2px;
    }

    /* Customize the label (the container) */
    .checkbox-container {
        display: block;
        position: relative;
        padding-left: 35px;
        margin-bottom: 12px;
        cursor: pointer;
        font-size: 22px;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    /* Hide the browser's default checkbox */
    .checkbox-container input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
    }

    /* Create a custom checkbox */
    .checkmark {
        position: absolute;
        top: 0;
        left: 0;
        height: 25px;
        width: 25px;
        background-color: #eee;
    }

    /* On mouse-over, add a grey background color */
    .checkbox-container:hover input ~ .checkmark {
        background-color: #ccc;
    }

    /* When the checkbox is checked, add a blue background */
    .checkbox-container input:checked ~ .checkmark {
        background-color: #cb0856;
    }

    /* Create the checkmark/indicator (hidden when not checked) */
    .checkmark:after {
        content: "";
        position: absolute;
        display: none;
    }

    /* Show the checkmark when checked */
    .checkbox-container input:checked ~ .checkmark:after {
        display: block;
    }

    /* Style the checkmark/indicator */
    .checkbox-container .checkmark:after {
        left: 9px;
        top: 5px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 3px 3px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
    }

    .template-choice {
        border: none;
        background-color: white;
    }

    .floating-card {
        margin: 6px 8px;
        background-color: white;
        padding: 6px 8px;
        border-radius: 8px;
    }

    .card-preview {
        position: relative;
    }

    .card-text {
        position: absolute;
        right: 2.7%;
        font-family: SplatRegular;
    }
</style>
