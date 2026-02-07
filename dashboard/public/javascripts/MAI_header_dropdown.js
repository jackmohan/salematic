function calHeaderFilter() {
    
    if($('table thead th.filter-col').length>0)
    {
        $('table thead th.filter-col').each(function () {

            let th = $(this);
            let table = th.closest("table");
            let colIndex = th.index();

            // ✅ Get original header text
            let headerText = th.text().trim();

            // ✅ Collect unique column values
            let values = [];
            table.find('tbody tr').each(function () {
                let text = $(this).find('td').eq(colIndex).text().trim();
                if (text && !values.includes(text)) values.push(text);
            });

            values.sort();

            // ✅ Build select options
            let options = '';
            values.forEach(v => {
                options += `<option value="${v}">${v}</option>`;
            });

            // ✅ Build FINAL header HTML
            let html = `
                <div class="filter-wrap">
                    <span class="filter-label1">${headerText}</span>
                    <span class="filter-icon" onclick="openHeaderFilter(${colIndex})">▼</span>
                    <div class="dropdown-menu sel-fil" style='display:none'>
                        <a class="dropdown-item close-sel-fil" href="#" style='text-align: right;'>X</a>
                        <a class="dropdown-item" href="#"><select multiple id="fil_${colIndex}" data-col="${colIndex}" class="filter-select" >
                            ${options}
                            </select>
                        </a>
                    <div>
                </div>
            `;

            th.html(html);

            // Init filter logic
            setTimeout(function () {
                headerFilter(colIndex, table);
            }, 0);

        });
    }
}
function openHeaderFilter(colIndex) {
    let select = document.getElementById('fil_' + colIndex);
    let wrap = select.closest('.filter-wrap');
    wrap.querySelector('.sel-fil').style.display = 'inline-block';
    select.focus();
}

    

function headerFilter(colIndex,table)
{
   
   let thText = table.find('thead th').eq(colIndex).attr('data-excel_content')
   
    //$('#fil_'+colIndex).show()
    table.find('select[multiple]#fil_'+colIndex).multiselect({
        placeholder: 'Select ' + thText,
        search: true,
        ///selectAll: true,
          searchOptions: {
            'default': 'Search ' + thText
        },
        allSelectedText: 'All '+thText  

    })
}

$(document).on('change', '[id^="fil_"][id$="_multiSelect"]', function () {

    var colIndex = this.id.match(/fil_(\d+)_/)[1];
    var table = $(this).closest("table");
    applyAllFilters(table);
});

function applyAllFilters(table) {
    var columnFilters = {}; // { colIndex: [values] }
    //$("th.filter-col").each(function () {
    table.find('thead th.filter-col').each(function () {
     
        var ind = $(this).index();
         
        var selected="";
        
        $("#fil_"+ind+" option[selected=selected]").each(function()
        {
            if(selected !=""){selected+=","}
            selected+=$(this).val().trim().toLowerCase()
        });
        if(selected!="")
        {
            columnFilters[ind] = selected;
        }
    })
    table.find('tbody tr').each(function () {

        let row = $(this);
        let showRow = true;

        $.each(columnFilters, function (colIndex, values) {

            if (!values || values.length === 0) return;
           // alert(cellText);
            let cellText = row.find('td').eq(colIndex)
                .text().trim().toLowerCase();

            if (!values.includes(cellText)) {
                showRow = false;
                return false; // break loop
            }else if(cellText ==""){
                 showRow = false;
            }
        });
        if(typeof $("#myInput").val() !="undefined")
        {
            globalSearch = $("#myInput").val().toLowerCase().trim();

            if (showRow && globalSearch) {
                let rowText = row.text().toLowerCase();
                if (!rowText.includes(globalSearch)) {
                    showRow = false;
                }
            }
        }
        //alert(showRow);
        row.toggle(showRow);
    });
}
$(document).on('click','.filter-col', function () {
    let th = $(this);
    let colIndex = th.closest("th").index();
    if (th.closest("th").find('.filter-icon').is(":visible")) {
        openHeaderFilter(colIndex);
      //  th.closest("th").removeClass('filter-col')
    }
    
});
$(document).on('click','.close-sel-fil', function () {
    let th = $(this);
    setTimeout(function () {
        th.closest("th").find('.sel-fil').hide();
    }, 5);
});
