/**
 * Created by fjh on 2017/12/5.
 */
const menuData = [
    {
        ttl: "数据集管理", openable: '1',
        item: [
            {ttl: "数据集列表", id: 'dataset_list', href: '/', openable: '0', item: []},
            {ttl: "添加数据集", id: 'dataset_create', href: '/create.html', openable: '0', item: []},
            {ttl: "数据词云", id: 'word_cloud', href: '/word_cloud.html', openable: '0', item: []},
        ]
    },
    {
        ttl: "训练组管理", openable: '1',
        item: [
            {ttl: "训练组列表", id: 'group_list', href: '/group', openable: '0', item: []},
            {ttl: "创建训练组", id: 'group_create', href: '/group/create.html', openable: '0', item: []},
            {ttl: "修改训练组", id: 'group_edit', href: '/group/edit.html', openable: '0', item: []},
            {ttl: "训练组图表", id: 'group_chart', href: '/group/charts.html', openable: '0', item: []}
        ]
    },
    {
        ttl: "训练管理", openable: '1',
        item: [
            {ttl: "训练列表", id: 'train_list', href: '/train', openable: '0', item: []},
            {ttl: "创建训练", id: 'train_create', href: '/train/create.html', openable: '0', item: []}
        ]
    },
    {
        ttl: "预测平台", openable: '1',
        item: [
            {ttl: "预测项目列表", id: 'prediction_list', href: '/prediction', openable: '0', item: []},
            {ttl: "创建预测项目", id: 'prediction_create', href: '/prediction/create.html', openable: '0', item: []},
            {ttl: "文本分类演示", id: 'prediction_perform', href: '/prediction/perform.html', openable: '0', item: []}
        ]
    },
];
$('header').html(
    '<div class="header">' +
    '<span class="header-left">文本分类测试系统</span>' +
    '<span class="header-right">' +
    '<a href="/login.html" onclick="clearAllCookie()">' +
    '<div style="color:#a1cbc2;cursor:pointer;">' +
    '<span>' +
    '<i class="fa fa-power-off fa-lg" aria-hidden="true"></i>' +
    '</span>' + ' | ' +
    '<span>退出</span>' +
    '</div>' +
    '</a>' +
    '</span>' +
    '</div>'
);
$('#headerSpread').append(
    '<p class="spreadLeft">' +
    '<span>平台导航</span>' +
    '<i id="sidebarToggle" class="fa fa-bars fa-lg" aria-hidden="true"></i>' +
    '</p>' +
    '<ol class="spreadList">' +
    '<li>当前位置：</li>' +
    '</ol>'
);
$('aside').html(
    '<div class="sidebar-inner scrollable-sidebar">' +
    '<div class="main-menu">' +
    '<ul class="accordion" id="main-menu">' +
    '<li><a><span>设备管理</span></a></li>' +
    '<li><a><span>设备管理</span></a></li>' +
    '<li><a><span>设备管理</span></a></li>' +
    '</ul>' +
    '</div>' +
    '</div>'
);
// 用于权限设置
$.ajaxSetup({
    // timeout: 10000,// 超时设置
    dataType: 'json',
    headers: {
        'auth': $.cookie('auth')
    },
    error: function (xhr) {
        if (xhr.status === 401) {
            return window.location.href = '/login.html';
        }
    }
});
function getLeftMenu(MenuData, page, container, list) {
    for (let i = 0; i < MenuData.length; i++) {
        const section = MenuData[i];
        const objNewLi = $('<li>');
        if (section["openable"] === "1") {
            objNewLi.addClass('openable');
        }
        const objNewA = $('<a>', {href: section["href"]});
        objNewA.append(
            '<span class="menu-content block">' +
            '<span class="menu-icon"><i class="block fa fa-th-large fa-lg"></i></span>' +
            '<span class="text m-left-sm">' + section["ttl"] + '</span>' +
            '</span>'
            // '<span class="menu-content-hover block">'+section["short"]+'</span>'
        );
        objNewLi.append(objNewA);
        if (section["item"].length > 0) {
            const objNewUl = $('<ul>', {class: 'submenu'});
            objNewLi.append(objNewUl);
            for (let j = 0; j < section["item"].length; j++) {
                const itemData = section["item"][j];
                const objSecondLi = $('<li>');
                objSecondLi.append(
                    '<a style="padding-left: 13px" href="' + itemData["href"] + '"><span class="submenu-label" style="display: block;">' + itemData["ttl"] + '</span></a>'
                );
                objNewUl.append(objSecondLi);
                if (itemData["id"] === page) {
                    objNewLi.addClass('open openColor');//二级菜单展开
                    objSecondLi.addClass('active');//三级菜单高亮
                    list.push(section["ttl"]);//二层
                    list.push(itemData["ttl"]);//三层
                }
            }

        }
        container.append(objNewLi);
    }
}
function getHeaderSpread(list) {
    for (let i = 0; i < list.length; i++) {
        if (i < list.length - 1) {
            $('.spreadList').append(
                '<li>' +
                '<span>' + list[i] + '</span>' +
                '<i class="fa fa-angle-right"></i>' +
                '</li>'
            )
        } else {
            $('.spreadList').append(
                '<li>' +
                '<span>' + list[i] + '</span>' +
                '</li>'
            )
        }

    }
}
function showMenu(page) {
    const container = $("#main-menu");
    const List = [];
    container.html("");

    //侧边栏菜单
    getLeftMenu(menuData, page, container, List);
    $('head title').html(List[List.length - 1] + " | 文本分类测试系统");
    getHeaderSpread(List);

    $('.scrollable-sidebar').slimScroll({
        height: '100%',
        size: '0px'
    });

    //侧边栏点击打开
    $('.sidebar-menu .openable > a').click(function () {
        if ($(this).parent().children('.submenu').is(':hidden')) {
            $(this).parent().siblings().removeClass('open').children('.submenu').hide();
            $(this).parent().addClass('open').children('.submenu').show();
        }
        else {
            $(this).parent().removeClass('open').children('.submenu').hide();
        }
        return false;
    });

    // 打开或关闭侧边栏菜单
    $("#sidebarToggle").click(function () {
        const menu = $('.sidebar-menu');
        if (menu.css('display') === 'block') {
            menu.hide();
            $('#main-container').removeClass('main-container-sidebar').addClass('main-container-none-sidebar');
        } else {
            menu.show();
            $('#main-container').removeClass('main-container-none-sidebar').addClass('main-container-sidebar');
        }
    });

    //初始化侧边栏状态
    $('.openable').children('.submenu').hide();
    $('.openable.open').children('.submenu').show();
}
// 绿圈
function loading(col) {
    const loading = $('<div>');
    loading.append(
        '<div class="load-container">' +
        '<div class="loader">' +
        '<div class="left-transparent"></div>' +
        '<div class="right-transparent"></div>' +
        '</div>' +
        // '<div class="clearfix"></div>'+
        '</div>'
    );
    const loadTr = $('<tr>', {'class': 'loading'});
    const loadTd = $('<td>', {'colspan': col});
    loadTd.append(loading);
    loadTr.append(loadTd);
    return loadTr;
}
// 获取url queryString
function queryString(id) {
    var e = {};
    try {
        var qs = document.URL.split('?')[1].split('&');
    }
    catch (ex) {
        return null;
    }
    if (!isNaN(id)) return e[qs[id].split('=')[1]];
    for (var i = 0; i < qs.length; i++) {
        e[qs[i].split('=')[0].toLowerCase()] = qs[i].split('=')[1];
    }
    if (id) {
        return e[id.toLowerCase()];
    }
    return e;
}
// 提示框封装函数
function prompt(name, msg, type) {
    if (!window.editModal) {
        window.editModal = $('<div class="modal fade editModal" id="editModal" tabindex="-1" role="dialog" >')
        document.body.appendChild(window.editModal[0])
    }
    window.editModal.empty();
    window.editModal.modal('show');
    var objHeader = $('<div/>', {class: "modal-header"});
    objHeader.append(
        '<button type="button" class="close" data-dismiss="modal" aria-label="close">' +
        '<span aria-hidden="true">&times;</span>' +
        '</button>' +
        '<h5 class="modal-title">' + name + '</h5>'
    );


    var objBody = $('<div/>', {class: "modal-body"});
    var objFooter = $('<div/>', {class: "modal-footer"});
    /*判断提示框type类型*/
    /*1、ask类型是询问是否取消、或者确定*/
    /*2、right类型是提示正确的提示信息*/
    /*3、error类型是提示错误的提示信息*/

    if (type == 'ask') {
        objBody.append(
            '<img src="../images/ask.png">' +
            '<span>' + msg + '</span>'
        );
        objFooter.append(
            '<button type="button" class="btn btn-default btnOff" data-dismiss="modal">取消</button>' +
            '<button type="button" class="btn btn-primary btnSure" data-dismiss="modal">确定</button>'
        );

        var objContent = $('<div/>', {class: "modal-content"});
        objContent.append(objHeader);
        objContent.append(objBody);
        objContent.append(objFooter);

    } else if (type == 'right') {
        objBody.append(
            '<img src="../images/right.png">' +
            '<span>' + msg + '</span>'
        );
        objFooter.append(
            '<button type="button" class="btn btn-default btnSure" data-dismiss="modal">确定</button>'
        );

        var objContent = $('<div/>', {class: "modal-content"});
        objContent.append(objHeader);
        objContent.append(objBody);
        objContent.append(objFooter);

    } else if (type == 'error') {
        objBody.append(
            '<img src="../images/error.png">' +
            '<span>' + msg + '</span>'
        );
        objFooter.append(
            '<button type="button" class="btn btn-default btnSure" data-dismiss="modal">确定</button>'
        );

        var objContent = $('<div/>', {class: "modal-content"});
        objContent.append(objHeader);
        objContent.append(objBody);
        objContent.append(objFooter);

    } else if (type == 'loading') {
        objBody.append(
            '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>' +
            '<p>' + msg + '</p>'
        );

        var objContent = $('<div/>', {class: "modal-content"});
        objContent.append(objHeader);
        objContent.append(objBody);
    }

    var objDialog = $('<div/>', {class: "modal-dialog", role: "document"});
    objDialog.append(objContent);
    /*主题弹出框*/
    var objEditModal = $('<div>', {class: "modal fade", id: "editModal", role: "dialog", tabindex: "-1"})
    objEditModal.append(objDialog)

    window.editModal.append(objDialog);

}
// 分页处理器加载
function pageCount(pages, page, total, elem, col, tb) {
    if (pages < 1) {
        $(tb).append(
            '<tr class=nodataTr>' +
            '<td  colspan=' + col + ' style="padding: 10px 0;text-align: center;" class="no-data ">暂无数据</td>' +
            '</tr>'
        );
    } else {
        //$('#pagers').html('');
        if (pages <= 5) {//前5页
            var pagerInHTML = '<span class="prev"> <i class="fa fa-lg fa-angle-left"></i></span>';
            for (var i = 1; i <= pages; i++) {
                if (i == page) {
                    pagerInHTML += '<span class="active" value=' + i + '>' + i + '</span>';
                } else {
                    pagerInHTML += '<span value=' + i + '>' + i + '</span>'
                }
            }
            pagerInHTML += '<span class="next"> <i class="fa fa-lg fa-angle-right"></i></span>';
            $(elem).append(pagerInHTML);
        } else if (pages > 5) {//大于5页
            if (page <= 3) {//前三个
                var pagerInHTML = '<span class="prev"> <i class="fa fa-lg fa-angle-left"></i></span>';
                for (var i = 1; i <= 5; i++) {
                    if (i == page) {
                        pagerInHTML += '<span class="active" value=' + i + '>' + i + '</span>';
                    } else {
                        pagerInHTML += '<span value=' + i + '>' + i + '</span>'
                    }
                }
                pagerInHTML += '<span value=' + pages + '>..' + pages + '</span>' +
                    '<span class="next"> <i class="fa fa-lg fa-angle-right"></i></span>';
                $(elem).append(pagerInHTML);
            } else if (pages - 3 < page) {//后三个
                var pagerInnerHTML = '<span class="prev"> <i class="fa fa-lg fa-angle-left"></i></span>' +
                    '<span value="1">1..</span>';

                for (var i = pages - 4; i <= pages; i++) {
                    if (i == page) {
                        pagerInnerHTML += '<span class="active" value=' + i + '>' + i + '</span>'
                    }
                    else {
                        pagerInnerHTML += '<span value=' + i + '>' + i + '</span>'
                    }
                }
                pagerInnerHTML += '<span class="next"> <i class="fa fa-lg fa-angle-right"></i></span>';
                $(elem).append(pagerInnerHTML);
            } else {//中间
                $(elem).append(
                    '<span class="prev"> <i class="fa fa-lg fa-angle-left"></i></span>' +
                    '<span value="1">1..</span>' +
                    '<span value=' + (page - 2) + '>' + (page - 2) + '</span>' +
                    '<span value=' + (page - 1) + '>' + (page - 1) + '</span>' +
                    '<span class="active" value=' + page + '>' + page + '</span>' +
                    '<span value=' + (page + 1) + '>' + (page + 1) + '</span>' +
                    '<span value=' + (page + 2) + '>' + (page + 2) + '</span>' +
                    '<span value=' + pages + '>' + '..' + pages + '</span>' +
                    '<span class="next"> <i class="fa fa-lg fa-angle-right"></i></span>'
                );
            }
        }
        $(elem).append(
            '跳转至第' +
            '<input type="text" class="pagerInput"/>页' +
            '<button class="btn btn-default btn-sm">跳转</button>'
        );
        $('#pageCounts').append(
            `<span class="hidden-sm hidden-xs">总计：${total}</span>`
        );
    }

    if (page == 1) {
        $('#pageCount').find('.prev').css("cursor", "not-allowed");
    }
    if (page == pages) {
        $('#pageCount').find('.next').css("cursor", "not-allowed");
    }
}
// 分页处理器逻辑
function createPageAccount() {
    const pageCount = $("#pageCount");
    const type = window.type || 0;
    pageCount.on('click', 'span', function () {
        data_page = parseInt(data_page);
        $('#searchList').empty();
        const pageClass = $(this).attr('class');
        // 上一页
        if (pageClass === 'prev') {
            if (data_page > 1) {
                data_page -= 1;
                loadList(data_page, type);
                return
            }
            $(this).css("cursor", "not-allowed");
            return
        }
        // 下一页
        if (pageClass === 'next') {
            if (data_page < data_pages) {
                data_page += 1;
                loadList(data_page, type);
                return
            }
            $(this).css("cursor", "not-allowed");
            return
        }
        // 数字页
        const value = $(this).attr('value');
        loadList(value, type);
    });
    // 前往第几页
    pageCount.on('click', '.btn', function () {
        let counts = $(this).prev().val(); // 页数
        if (counts < 1) {
            counts = 1;
        } else if (counts > window.data_pages) {
            counts = window.data_pages;
        }
        loadList(counts, type);
    })
}
// 时间戳
function unixToTime(unixTime) {
    var timeobj = new Date(unixTime);
    var year = timeobj.getFullYear();
    var month = timeobj.getMonth() + 1;
    var date = timeobj.getDate();
    var hour = timeobj.getHours();
    var minute = timeobj.getMinutes();
    var seconds = timeobj.getSeconds();
    var timeStr = year + '-';
    timeStr = timeStr + (month < 10 ? '0' : '') + month + '-';
    timeStr = timeStr + (date < 10 ? '0' : '') + date + ' ';
    timeStr = timeStr + (hour < 10 ? '0' : '') + hour + ':';
    timeStr = timeStr + (minute < 10 ? '0' : '') + minute + ':';
    timeStr = timeStr + (seconds < 10 ? '0' : '') + seconds;
    return timeStr;
}
