const express = require("express");
const router = express.Router();
const { getTemplates, deleteTemplate } = require("../dal/databaseApi");
const { uploadTemplate, deleteImage } = require("../dal/imgApi");
const multer  = require('multer');
const upload = multer({ storage: multer.memoryStorage({}) });

router.get("/templates", async (req, res) => {
    if (req.session.userId) {
        const templates = (await getTemplates()).filter(template => template.userId === req.session.userId);

        return res.json(templates);
    }
    
    res.redirect("/");
});

// TODO: revisit search if we end up with a massive quantity of templates
router.get("/templates/all", async (req, res) => {
    if (req.session.userId) {
        return res.json(await getTemplates());
    }

    res.redirect("/");
});

router.post("/templates/save", upload.single('img'), async (req, res) => {
    try {
        if (!req.session.userId)
            return res.redirect("/");

        if (req.file) {
            await uploadTemplate(req.session.userId, req.body.slot, req.file.buffer, req.body.name, req.body.searchTerms, req.body.friendcodecolor, req.body.namecolor);
        }
    } catch (err) {
        return res.status(500).send({
            body: "error"
        });
    }

    res.redirect("/templates");
});

router.post("/templates/delete", express.json(), async (req, res) => {
    try {
        if (!req.session.userId)
            return res.redirect("/");

        const templates = (await getTemplates()).filter(template => template.userId === req.session.userId && template.slot === req.body.slot);

        if (templates && templates.length === 1) {
            const template = templates[0];

            // delete the record
            await deleteTemplate(req.session.userId, req.body.slot);

            // delete it from imgur
            await deleteImage(template.deleteHash);
        }
    } catch (err) {
        return res.status(500).send({
            body: "error"
        });
    }
    
    res.redirect("/templates");
});

module.exports = router;