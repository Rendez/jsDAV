/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Luis Merino
 * @author Luis Merino <mail AT luismerino DOT name>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */

var jsDAV             = require("./../../jsdav"),
    jsDAV_Dropbox_Node     = require("./node").jsDAV_Dropbox_Node,
    jsDAV_Dropbox_File     = require("./file").jsDAV_Dropbox_File,
    jsDAV_Directory   = require("./../directory").jsDAV_Directory,
    jsDAV_iCollection = require("./../iCollection").jsDAV_iCollection,
    jsDAV_iQuota      = require("./../iQuota").jsDAV_iQuota,

    Exc               = require("./../exceptions");

function jsDAV_Dropbox_Directory(dropbox, root, path) {
    this.dropbox = dropbox;
    this.root = root;
    this.path = path;
}

exports.jsDAV_Dropbox_Directory = jsDAV_Dropbox_Directory;

(function() {
    this.implement(jsDAV_Directory, jsDAV_iCollection, jsDAV_iQuota);

    /**
     * Creates a new file in the directory
     *
     * data is a readable stream resource
     *
     * @param string name Name of the file
     * @param resource data Initial payload
     * @return void
     */
    this.createFile = function(name, data, enc, cbfscreatefile) {
        var newPath = this.path + "/" + name;
        
        if (data.length === 0) {
            data = new Buffer(0);
            enc  = "application/octet-stream";
        }
        if (enc)
            this.dropbox.putFile(this.root, newPath, data, enc, cbfscreatefile);
        else
            this.dropbox.putFile(this.root, newPath, data, cbfscreatefile);
    };

    /**
     * Creates a new subdirectory
     *
     * @param string name
     * @return void
     */
    this.createDirectory = function(name, cbfscreatedir) {
        var newPath = this.path + "/" + name;

        this.dropbox.createFolder(this.root, newPath, cbfscreatedir);
    };

    /**
     * Returns a specific child node, referenced by its name
     *
     * @param string name
     * @throws Sabre_DAV_Exception_FileNotFound
     * @return Sabre_DAV_INode
     */
    this.getChild = function(name, cbfsgetchild) {
        var dropbox = this.dropbox;
        var root = this.root;
        var path = this.path + "/" + name;
        var hash = null;
        var list = false;
        var limit = 0;
        
        dropbox.metadata(root, path, limit, hash, list, function(err, stat) {
            if (err)
                return cbfsgetchild(err);
            
            cbfsgetchild(null, stat.is_dir
                ? new jsDAV_Dropbox_Directory(dropbox, root, realPath)
                : new jsDAV_Dropbox_File(dropbox, root, realPath))
        });
    };

    /**
     * Returns an array with all the child nodes
     *
     * @return Sabre_DAV_INode[]
     */
    this.getChildren = function(cbfsgetchildren) {
        var nodes = [];
        var dropbox = this.dropbox;
        var root = this.root;
        var path = this.path;
        
        var limit = 5000;
        var hash = null;
        var list = true;
        
        dropbox.metadata(root, path, limit, hash, list, function(err, data) {
            if (err)
                return cbfsgetchildren(err); // @todo Map exceptions from DB to jsDav.
            
            data.contents.forEach(function(stat) {
                nodes.push(stat.is_dir
                     ? new jsDAV_Dropbox_Directory(dropbox, root, stat.path)
                     : new jsDAV_Dropbox_File(dropbox, root, stat.path)
                );
            });
            
            cbfsgetchildren(null, nodes);
        });
    };

    /**
     * Deletes all files in this directory, and then itself
     *
     * @return void
     */
    this["delete"] = function(cbfsdel) {
        this.dropbox['delete'](this.root, this.path, cbfsdel);
    };

    /**
     * Returns available diskspace information
     *
     * @return array
     */
    this.getQuotaInfo = function(cbfsquota) {
        this.dropbox.accountInfo(function(err, data) {
            var info = data.quota_info;
            if (err || !info)
                return cbfsquota(err, [0, 0]);
            
            cbfsquota(null, [info.normal - info.quota, info.quota]);
        });
    };
}).call(jsDAV_Dropbox_Directory.prototype = new jsDAV_Dropbox_Node());
