<script>
    // TODO: convert this into a more API format
    import { onMount } from 'svelte';

    import { getDrip } from '../stores/dripStore';

    export let userdata = {};
    export let location = "";

    let dripdata = {};

    onMount(async () => {
        dripdata = await getDrip();
    });

    function loadFile(e) {
        if (e.target.files) {
            jQuery("#original-drip").hide();
            jQuery("#new-drip").show();
            jQuery("#upload-new-image").show();

            let imageFile = e.target.files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                var img = document.createElement("img");
                img.onload = function (event) {
                    var MAX_WIDTH = 512;
                    var MAX_HEIGHT = 512;

                    var width = img.width;
                    var height = img.height;

                    // Change the resizing logic
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height = height * (MAX_WIDTH / width);
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width = width * (MAX_HEIGHT / height);
                            height = MAX_HEIGHT;
                        }
                    }

                    var canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    // Show resized image in preview element
                    var dataurl = canvas.toDataURL(imageFile.type);
                    document.getElementById("preview").src = dataurl;
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(imageFile);
        }
    }

    async function uploadNewImage() {
        var resizedImage = dataURLToBlob(document.getElementById("preview").src);
        var data = new FormData();
        data.append('drip', resizedImage);

        jQuery("#upload-new-image").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Loading...');

        jQuery.ajax({
            url: "/api/drip/save",
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function() {
                location.reload();
            },
            error: function() {
                alert("Upload failed");
                location.reload();
            }
        });
    }

    /* Utility function to convert a canvas to a BLOB */
    function dataURLToBlob(dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = parts[1];

            return new Blob([raw], {type: contentType});
        }

        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }
</script>

<div class="container">
    <div class="row">
        <div class="col-12 col-md-6 offset-md-3" id="original-drip">
            {#if dripdata.drip}
                <div>
                    <h3>
                        <a href="/"><i class="fa fa-chevron-left"></i></a>
                        Your drip
                    </h3>
                </div>
                <div class="drip-img">
                    <img src={dripdata.drip} class="drip-pic" alt="drip" />
                    <form action="/api/drip/delete" method="post" class="delete-drip">
                        <button type="submit" value="submit">
                            <i class="fa fa-close"></i>
                        </button>
                    </form>
                </div>
            {:else}
                <div class="drip-img">
                    <img src="/css/img/nodrip.png" class="drip-pic" alt="no drip" />
                </div>
            {/if}
        </div>
        <div class="col-12 col-md-6 offset-md-3" id="new-drip" style="display:none;">
            <div>
                <h3>
                    <a href="/"><i class="fa fa-chevron-left"></i></a>
                    New drip
                </h3>
                <button type="button" class="btn btn-primary" id="upload-new-image" style="display: none;position:absolute;top:5px;right:15px;" on:click={uploadNewImage}>Save Changes</button>
            </div>
            <div class="drip-img">
                <img id="preview" class="drip-pic" alt="drip" />
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12 col-md-6 offset-md-3">
            {#if dripdata.blockupload}
                <h2>Upload limit reached</h2>
                <div>Each user is allowed 3 uploads per week. The limit has been reached.</div>
            {:else}
                <input id="image-input" name="drip" type="file" class="btn btn-primary" accept=".jpg,.png,image/jpeg,image/png" style="width:100%" on:change={loadFile} />
            {/if}
        </div>
    </div>
</div>