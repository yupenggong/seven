var Seven = {
    currentMode : 'timeline',
    currentRepositoryId : false,
    ajaxUrl : 'ajax.php',

    getRepositoryList: function(){
        var repositoryListDiv = $('#repository-list');
        var repositoryListInner = $('#repository-list-inner');
        
        $.ajax({
            url: this.ajaxUrl,
            type: 'POST',
            dataType: 'json',
            data: {
                'action' : 'repositories'
            },
            success: function(data) {
                if (data.length > 0) {
                    for (var i in data){
                        repositoryListInner.append('<li>\n\
                                                <a href="javascript:void(0)" rel="'+ i +'">' + data[i].name + '</a>\n\
                                                <br>\n\
                                                <span class="quiet">' + data[i].url + '</span>\n\
                                                </li>');
                    }
                    return true;
                } else {
                    repositoryListDiv.html('No repositories found.');
                    return false;
                }
            },
            error: function() {
                repositoryListDiv.html('An error occured when fetching repository list.');
                return false;
            }
        })
    },

    setRepositoryId: function(repository_id) {
        this.currentRepositoryId = repository_id;
        return true;
    },

    getRepositoryId: function() {
        return this.currentRepositoryId;
    },
    
    setMode: function(mode) {
        this.currentMode = mode;
        $('#modes a').each(function() {
            $(this).removeClass('selected');
        });
        $('#' + mode).addClass('selected');
        if (this.getRepositoryId() === false) {
            return false;
        }
        this.action(this.getRepositoryId());
        return true
    },
    
    getMode: function() {
        return this.currentMode;
    },
    
    action : function(repository_id) {
        if (this.getRepositoryId() != repository_id) {
            $('#revision').val('');
        }
       
        switch (Seven.getMode()) {
            case 'timeline':
                var breadcrumbDiv = $('#breadcrumb');
                breadcrumbDiv.empty(); 
                Timeline.getRepositoryLog(repository_id);
                break;
                
            case 'browse':
                Browse.getFolder(repository_id);
                break;
            
            default:
                break;
        }
    },
    
    createBreadcrumb: function(data) {
        var breadcrumbDiv = $('#breadcrumb');
        breadcrumbDiv.empty(); 
        if (data.length > 0) {
            for (var i in data) {
                breadcrumbDiv.append('<a href="javascript:void(0)" rel="' + data[i].url + '">' + data[i].name + '</a> / ');
            }
            return true;
        }
        return false;
    }
    
}

var Timeline = {
    
    getRepositoryLog: function(repository_id, path){
        Seven.setRepositoryId(repository_id);
        var contentDiv = $('#content');
        contentDiv.html('<div class="success">Fetching logs..</div>');
        $.ajax({
            url: Seven.ajaxUrl,
            type: 'POST',
            dataType: 'json',
            data: {
                'action' : 'log',
                'repository_id' : repository_id,
                'limit' : $('#limit').val(),
                'revision' : $('#revision').val(),
                'path': path
            },
            success: function(data) {
                if (data.length > 0) {
                    contentDiv.empty();
                    for (var i in data){
                        contentDiv.append('<div id="revision-log-' + data[i].revision + '" class="revision-log clearfix"></div>');
                        $('#revision-log-' + data[i].revision).append('<div class="revision-number span-2 colborder">' + data[i].revision + '</div>');
                        $('#revision-log-' + data[i].revision).append('<div class="revision-author span-5 quiet">' + data[i].author + ', ' + data[i].date + '</div>');
                        $('#revision-log-' + data[i].revision).append('<div class="revision-message span-10 last">' + data[i].message + '</div>');
                        if (data[i].files.length > 0) {
                            var files = data[i].files;
                            contentDiv.append('<ul id="revision-log-' + data[i].revision + '-files" class="revision-files clearfix"></div>');
                            for (var j in files) {
                                $('#revision-log-' + data[i].revision + '-files').append('<li>' + files[j].filename + ', ' + files[j].action + '</li>');
                            }
                        }
                    }
                    return true;
                } else {
                    contentDiv.html('<div class="notice">No commit log found.</div>');
                    return false;
                }
            },
            error: function() {
                $(contentDiv).html('<div class="error">An error occured when fetching commit logs.</div>');
                return false;
            }
        });
    }    
    
}

var Browse = {
    
    getFolder: function(repository_id, path){   
        Seven.setRepositoryId(repository_id);
        var contentDiv = $('#content');
        contentDiv.html('<div class="success">Fetching files..</div>');
        $.ajax({
            url: Seven.ajaxUrl,
            type: 'POST',
            dataType: 'json',
            data: {
                'action' : 'ls',
                'repository_id' : repository_id,
                'revision' : $('#revision').val(),
                'path': path
            },
            success: function(data) {
                var files = data.files;
                if (files && files.length > 0) {
                    Seven.createBreadcrumb(data.breadcrumb);
                    contentDiv.empty();
                    for (var i in files){
                        contentDiv.append('<div id="repository-file-' + i + '" class="repository-file clearfix"></div>');
                        $('#repository-file-' + i).append('<div class="file-kind span-1"><img src="assets/img/' + files[i].kind + '.png" /></div>');                        
                        $('#repository-file-' + i).append('<div class="file-name span-8"><a href="javascript:void(0)" kind="' + files[i].kind + '" rel="'+ data.path[0] + '/' + files[i].name +'" >' + files[i].name + '</a></div>');                        
                        $('#repository-file-' + i).append('<div class="file-size span-2">' + files[i].size + '</div>');                        
                        $('#repository-file-' + i).append('<div class="file-revision span-2">r' + files[i].revision + '</div>');                        
                        $('#repository-file-' + i).append('<div class="file-author span-5 quite last">' + files[i].author + ', ' + files[i].date + '</div>');                        
                    }
                    return true;
                } else {
                    contentDiv.html('<div class="notice">No file found.</div>');                    
                    return false;
                }
            },
            error: function() {
                $(contentDiv).html('<div class="error">An error occured when fetching file list.</div>');                
                return false;
            }
        });        
    },
    
    getFile: function(repository_id, path){   
        Seven.setRepositoryId(repository_id);
        var contentDiv = $('#content');
        contentDiv.html('<div class="success">Fetching files..</div>');
        $.ajax({
            url: Seven.ajaxUrl,
            type: 'POST',
            dataType: 'json',
            data: {
                'action' : 'cat',
                'repository_id' : repository_id,
                'revision' : $('#revision').val(),
                'path': path
            },
            success: function(data) {
                if (data) {
                    // Needs improvements
                    contentDiv.html('<pre id="rawcode" class="prettyprint"></pre>');
                    $('#rawcode').text(data);
                    prettyPrint();
                } else {
                    contentDiv.html('<div class="notice">File cannot be fetched.</div>');                    
                    return false;
                }
            },
            error: function() {
                $(contentDiv).html('<div class="error">An error occured when fetching file.</div>');                                
                return false;
            }
        });        
    }    
    
}


// Stuff to do as soon as the DOM is ready;

$(document).ready(function() {
    Seven.setMode('timeline');
    Seven.getRepositoryList();
    $('#refresh').click(function () {
        Seven.action($(this).attr('rel'));
    })
    $('#revision').focus(function() {
        $('#revision-notice').fadeIn(1000)
    });
    $('ul#repository-list-inner > li a').live('click', function(){
        Seven.action($(this).attr('rel'));
    });
    $('#modes a').live('click', function(){
        Seven.setMode($(this).attr('rel'));
    });
    $('.file-name a').live('click', function(){
        switch ($(this).attr('kind')) {
            case 'file':
                Browse.getFile(Seven.getRepositoryId(), $(this).attr('rel'));
                break;
            case 'dir':
                Browse.getFolder(Seven.getRepositoryId(), $(this).attr('rel'))
                break;


            default:
                break;
        }
    });
    $('#breadcrumb a').live('click', function(){
        Browse.getFolder(Seven.getRepositoryId(), $(this).attr('rel'))
    });


});

