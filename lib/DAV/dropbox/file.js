/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Ajax.org B.V. <info AT ajax DOT org>
 * @author Mike de Boer <info AT mikedeboer DOT nl>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */

var jsDAV           = require("./../../jsdav"),
    jsDAV_Dropbox_Node   = require("./node").jsDAV_Dropbox_Node,
    jsDAV_Directory = require("./../directory").jsDAV_Directory,
    jsDAV_iFile     = require("./../iFile").jsDAV_iFile,

    Fs              = require("fs"),
    Exc             = require("./../exceptions"),
    Util            = require("./../util");

function jsDAV_Dropbox_File(dropbox, root, path) {
    this.dropbox = dropbox;
    this.root = root;
    this.path = path;
}

exports.jsDAV_Dropbox_File = jsDAV_Dropbox_File;

(function() {
    this.implement(jsDAV_iFile);

    /**
     * Updates the data
     *
     * @param {mixed} data
     * @return void
     */
    this.put = function(data, enc, cbfsput) {
        var ctype = Util.mime.type(this.path);
        
        this.dropbox.putFile(this.root, this.path, data, ctype, cbfsput);
    };

    /**
     * Returns the data
     *
     * @return Buffer
     */
    this.get = function(cbfsfileget) {
        this.dropbox.getFile(this.root, encodeURI(this.path), cbfsfileget);
    };

    /**
     * Delete the current file
     *
     * @return void
     */
    this["delete"] = function(cbfsfiledel) {
        this.dropbox["delete"](this.root, this.path, cbfsfiledel);
    };

    /**
     * Returns the size of the node, in bytes
     *
     * @return int
     */
    this.getSize = function(cbfsgetsize) {
        var hash = null;
        var list = false;
        var limit = 0;
        
        this.dropbox.metadata(this.root, this.path, limit, hash, list, function(err, stat) {
            if (err)
                return cbfsgetsize(err);
            
            cbfsgetsize(null, stat.bytes);
        });
    };

    /**
     * Returns the ETag for a file
     * An ETag is a unique identifier representing the current version of the file.
     * If the file changes, the ETag MUST change.
     * Return null if the ETag can not effectively be determined
     *
     * @return mixed
     */
    this.getETag = function(cbfsgetetag) {
        cbfsgetetag(null, null);
    };

    /**
     * Returns the mime-type for a file
     * If null is returned, we'll assume application/octet-stream
     *
     * @return mixed
     */
    this.getContentType = function(cbfsmime) {
        return cbfsmime(null, Util.mime.type(this.path));
    };
}).call(jsDAV_Dropbox_File.prototype = new jsDAV_Dropbox_Node());
