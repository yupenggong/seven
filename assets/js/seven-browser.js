var Browser = {
    currentRepository : false,
    currentRevision : false,
    ajaxUrl : 'ajax.php',

    getRepositories: function(){
        var repositoryListDiv = '#repository-list';
        $.ajax({
            url: this.ajaxUrl,
            type: 'POST',
            dataType: 'json',
            data: {
                'action' : 'repositories'
            },
            success: function(data) {
                if (data.length > 0) {

                    $(repositoryListDiv).html('<ul></ul>')
                    var repositoryListUl = $(repositoryListDiv +' ul');

                    for (var i in data){
                        repositoryListUl.append('<li>\n\
                                                <a href="javascript:void(0)" onclick="Browser.getRepositoryLog('+ i +')">' + data[i].name + '</a>\n\
                                                <br>\n\
                                                <span class="quiet">' + data[i].url + '</span>\n\
                                                </li>')
                    }

                } else {
                    $(repositoryListDiv).html('No repositories found.')
                }
            },
            error: function() {
                $(repositoryListDiv).html('An error occured when fetching repository list.')
            }
        })
    },

    getRepositoryLog: function(repository_id){
        var contentDiv = '#content';
        $(contentDiv).html('<div class="success">Fetching logs..</div>')
        $.ajax({
            url: this.ajaxUrl,
            type: 'POST',
            dataType: 'json',
            data: {
                'action' : 'log',
                'repository_id' : repository_id,
                'limit' : $('#limit').val(),
                'revision-start' : $('#revision-start').val(),
                'revision-end' : $('#revision-end').val()
            },
            success: function(data) {
                if (data.length > 0) {

                    $(contentDiv).empty()
                    for (var i in data){
                        $(contentDiv).append('<div id="revision-log-' + data[i].revision + '" class="revision-log clearfix"></div>')

                        $('#revision-log-' + data[i].revision).append('<div class="revision-number span-2 colborder">' + data[i].revision + '</div>')
                        $('#revision-log-' + data[i].revision).append('<div class="revision-author-date span-5 quiet">' + data[i].author + ', ' + data[i].date + '</div>')
                        $('#revision-log-' + data[i].revision).append('<div class="revision-message span-10 last">' + data[i].message + '</div>')

                        if (data[i].files.length > 0) {
                            var files = data[i].files
                            $(contentDiv).append('<ul id="revision-log-' + data[i].revision + '-files" class="revision-files clearfix"></div>')
                            for (var j in files) {
                                $('#revision-log-' + data[i].revision + '-files').append('<li>' + files[j].filename + ', ' + files[j].action + '</li>')
                            }
                        }

                    }

                } else {
                    $(contentDiv).html('<div class="notice">No commit log found.</div>')
                }
            },
            error: function() {
                $(contentDiv).html('<div class="error">An error occured when fetching commit logs.</div>')
            }
        })
    }
}

// Stuff to do as soon as the DOM is ready;

$(document).ready(function() {
    Browser.getRepositories()
});