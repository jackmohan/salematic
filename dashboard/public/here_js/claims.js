$(document).ready(function() {
    var status = $("#c_status").val();
    if (status == "Submitted" || status == "Received") {
        $('table#sales-return tbody tr').each(function() {
            var amt = Number($(this).children("td.claim_inc_tax").html())
            $(this).children('td.app_amount_inc_tax').children(".editable").children().val(amt)
            without_tax($(this).closest('tr'));
        });
        $('table#non-sales-return tbody tr').each(function() {
            var amt = Number($(this).children("td.claim_inc_tax").html())
            $(this).children('td.app_amount_inc_tax').children(".editable").children().val(amt)
            without_tax($(this).closest('tr'));
        });
        $('table#Recipt-mismatch tbody tr').each(function() {
            var amt = Number($(this).children("td.claim_inc_tax").html())
            $(this).children('td.app_amount_inc_tax').children(".editable").children().val(amt)
            without_tax($(this).closest('tr'));
        });
        $('table#other-claims tbody tr').each(function() {
            var amt = Number($(this).children("td.claim_inc_tax").html())
            $(this).children('td.app_amount_inc_tax').children(".editable").children().val(amt)
            without_tax($(this).closest('tr'));
        });
    }
})

$(document).on('keyup', "input[name=gst], input[name=price]", function(e) {
    // alert("sdf");
    //return /^-?\d*[.,]?\d{0,2}$/.test(value);
    //   var valid = /^\d{0,15}(\.\d{0,2})?$/.test(this.value),
    var valid = /^-?\d*[.,]?\d{0,2}$/.test(this.value),
        val = this.value;
    if (!valid) {
        // this.value = val.substring(0, val.length - 1);
        myString = val.substring(0, val.length - 1);
        this.value = myString.replace(/[^.\d]/g, '');
        //   e.preventDefault();
        // return false;
    }
});
$(document).on('keypress', "input[name=gst], input[name=price]", function(evt) {
    // alert(evt.which);
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode != 46) && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
});
$(document).on('keyup', "input[name=approved_amount], input[name=price]", function(e) {
    tot_amount_Cal_otherclaims($(this).closest('tr'));
});


function tot_amount_Cal_otherclaims(obj) {
    var price = Number(obj.children('td.approved_amount').children(".editable").children().val());
    // var qty = Number(obj.children('td.qty').children().children().val());
    var gst = Number(obj.children('td.gst').html());
    // var amount = Number(obj.children('td.amount').children().children().val());
    var igst_flag = $("#igst_flag").val();
    var a_igst_val = 0
    var a_cgst_val = 0
    var a_sgst_val = 0

    if (igst_flag == 1) {
        var a_igst_val = (gst * price) / 100;
        tot_amount = a_igst_val + price;
    } else {
        var a_cgst_val = ((gst / 2) * price) / 100;
        var a_sgst_val = ((gst / 2) * price) / 100;
    }
    tot_amount = a_igst_val + a_cgst_val + a_sgst_val + price;
    tot_amount = tot_amount.toFixed(2);
    obj.children('td.app_amount_inc_tax').attr("data-a_igst_amount", a_igst_val)
    obj.children('td.app_amount_inc_tax').attr("data-a_cgst_amount", a_cgst_val)
    obj.children('td.app_amount_inc_tax').attr("data-a_sgst_amount", a_sgst_val)
    obj.children('td.app_amount_inc_tax').html(tot_amount)
    overallCalculation(obj);
}

function overallCalculation(obj) {
    var table_name = obj.closest('table').attr("id")
    var tot_igst = 0;
    var tot_sgst = 0;
    var tot_cgst = 0;
    var gross_amount = 0;
    $('table#' + table_name + ' tbody tr').each(function() {
        var amount = Number($(this).children("td.approved_amount").children('.editable').children().val());
        var igst = Number($(this).children("td.app_amount_inc_tax").attr("data-a_igst_amount"));
        var cgst = Number($(this).children("td.app_amount_inc_tax").attr("data-a_cgst_amount"));
        var sgst = Number($(this).children("td.app_amount_inc_tax").attr("data-a_sgst_amount"));
        tot_igst = Number(tot_igst) + Number(igst);
        tot_sgst = Number(tot_sgst) + Number(sgst);
        tot_cgst = Number(tot_cgst) + Number(cgst);
        gross_amount = Number(gross_amount) + Number(amount);
    });
    var net_total = gross_amount + tot_igst + tot_sgst + tot_cgst;
    rounded_array = AmountRoundFunction(net_total);
    // console.log(JSON.stringify(rounded_array));
    roundoff_amount = NumberToCurrecyForment(rounded_array["roundoff_amount"].toFixed(2));
    rounded_net_total = NumberToCurrecyForment(rounded_array["rounded_amount"].toFixed(2));
    var over_all_table_name = table_name + "-tot";
    var over_table_obj = $("#" + over_all_table_name).children('tbody');
    over_table_obj.children('tr.igst').children('td.igst').html(NumberToCurrecyForment(tot_igst.toFixed(2)))
    over_table_obj.children('tr.sgst').children('td.sgst').html(NumberToCurrecyForment(tot_sgst.toFixed(2)))
    over_table_obj.children('tr.cgst').children('td.cgst').html(NumberToCurrecyForment(tot_cgst.toFixed(2)))
    over_table_obj.children('tr.gross').children('td.gross-amount').html(NumberToCurrecyForment(gross_amount.toFixed(2)))
    over_table_obj.children('tr.round').find(".roundoff-adjustment").html((roundoff_amount));
    over_table_obj.children('tr.net-tot').find(".tot-amt").html((rounded_net_total));
    //      $(".payment-discount").html("<b>(-) </b> <span style='color:red'>"+net_disc+"</span>");
}

function AmountRoundFunction(amount) {
    var return_array = new Array();
    var rounded_amount = Math.round(Number(amount));
    return_array["non_rounded_amount"] = amount;
    return_array["rounded_amount"] = rounded_amount;
    if (Number(rounded_amount) == Number(amount)) {
        return_array["roundoff_amount"] = 0;
    } else if (Number(rounded_amount) > Number(amount)) {
        difrence_amount = Number(rounded_amount) - Number(amount);
        return_array["roundoff_amount"] = difrence_amount;
    } else if (Number(rounded_amount) < Number(amount)) {
        difrence_amount = Number(amount) - Number(rounded_amount);
        return_array["roundoff_amount"] = difrence_amount;
    }
    return return_array;
}
$(document).on('select2:select', '[id="vendor"]', function(e) {
    var layoyt = '<div class="row"></br><div class="col-md-3">Owner Name  </div><div class="col-md-1">:</div><div class="col-md-7" style=" font-weight: bold;">' + $("#vendor").find(":selected").attr('data-vendor_contact_person') + '</div></div>';
    layoyt += '<div class="row"><div class="col-md-3">GST   </div><div class="col-md-1">:</div><div class="col-md-7 vendorgst" style=" font-weight: bold;">' + $("#vendor").find(":selected").attr('data-vendor_gst') + '</div></div>';
    layoyt += '<div class="row"><div class="col-md-3">Billing Address   </div><div class="col-md-1">:</div><div class="col-md-7" style=" font-weight: bold;">' + $("#vendor").find(":selected").attr('data-vendor_billing_address') + '</div></div>';
    $(".address-details").html(layoyt);
});
$(document).on('click', '.alert-previous-person', function(e) {
    // list_details();
    var first_emp_id = $(this).attr("name");
    var emp_name = $("table#Approval-List").children('tbody').children("tr#"+first_emp_id).attr("data-emp_name");
    var designation = $("table#Approval-List").children('tbody').children("tr#"+first_emp_id).attr("data-designation");
    //alert(emp_name+" [ "+designation+" ] Need to approve first");
    alert("Can't allow to approval since waiting for "+emp_name+" approval to proceed further.");
});

$(document).ready(function() {
    // $('.claims-item').find('td .oth-editable').show();
    //     $('.claims-item').find('td .oth-non-editable').hide();
    $(".approve-btn").click(function(e) {
        $(".Sales_Return").trigger('click');
        var emp_id =$(this).attr('name');
        $("#approval_emp_id").val(emp_id);
        $("#approval_emp_id").prop("disabled",true);
        $(".edit_mode_hide").hide();
        
    })
    if ($("#key").val() != "add") {
        $('.claims-item').find('td .editable').hide();
        $('.claims-item').find('td .non-editable').show();

       
    }
    $(".editbtn").click(function(e) {
        $('.claims-item').find('td .non-editable').hide();
        $('.claims-item').find('td .editable').show();
        $('.add-row-other-claim, .other-claim-remove-all-tr , .Other-Claim-action').show();
        $('.viewbtn').show();
        $('.editbtn').hide();
        $("#key").val("update");
        $('.submit').show();
        //$('#claim_status').attr("disabled", false)
        $('#claim_reason').attr("disabled", false)
        $('.activity_type1').hide();
        $('.checkbox_td').show();
        var no_of_combo = $("#no_of_combo").val();
        
        if(Number(no_of_combo) >0){
            for(i=0 ;i<no_of_combo; i++){
                var select_id = "product_name"+(Number(i)+1);
                $("#"+select_id).select2({  width: '100%',
                });
                var category_id =$("table#other-claims tbody tr:eq("+i+")").children('td.product-name').attr('data-category_id');
                $("#"+select_id).val(category_id).trigger('change');
            }
        }
    });
    $(".viewbtn").click(function(e) {
        $('.claims-item').find('td .non-editable').show();
        $('.claims-item').find('td .editable').hide();
        $('.editbtn').show();
        $('.viewbtn').hide();
        $("#key").val("view");
        $('.submit').hide();
        $('.add-row-other-claim , .other-claim-remove-all-tr, .Other-Claim-action').hide();
        $('#claim_status').attr("disabled", true)
        $('#claim_reason').attr("disabled", true)
        $('.activity_type1').show();
        $('.checkbox_td').hide();
        $(".edit_mode_hide").show();
    });
    $(".detail_back").click(function(e) {
        var previous_value = $(".add_nav .nav-item .active").attr('previous_page');
        // alert(previous_value)
        var flag = true;
        if (flag == true) {
            $("." + previous_value).trigger('click');
        }
    });
    $(".detail_Proceed").click(function(e) {
        var next_page = '';
        var current_tab = $(".add_nav .nav-item .active").attr('current_page');
        next_page = $(".add_nav .nav-item .active").attr('next_page');
        var claim_month_year = $("#month_year").val();
        var vendor_id = $("#vendor").find(":selected").val();
        var brand_id = $("#brand_name").find(":selected").val();
        var key = $("#key").val();
        var flag = true;
        if (current_tab == "claims_details") {
            if (!vendor_id) {
                flag = false;
                alert("Please Select vendor");
            } else if (!brand_id) {
                flag = false;
                alert("Please Select Brand");
            } else if (!claim_month_year) {
                flag = false;
                alert("Please Select Claims Month");
            }
        }
        var sales_retrun_flag = true;
        var non_sales_retrun_flag = true;
        var recipit_mismatch_flag = true;
        if ($("#checkbox_verfiy").val() == "yes") {
            if (current_tab == "Sales_Return") {
                if (key == "update") {
                    $("#sales-return").find("input[type=checkbox][name=check_flag]").each(function() {
                        if ($(this).prop("checked") == false) {
                            flag = false;
                            sales_retrun_flag = false
                            // break;
                        }
                    });
                }
            }
            if (sales_retrun_flag == false) {
                alert("Please Select all Checkbox for Sales Return 1")
            }
            
            if (current_tab == "Non_Sales_Return") {
                if (key == "update") {
                    $("#non-sales-return").find("input[type=checkbox][name=check_flag]").each(function() {
                        if ($(this).prop("checked") == false) {
                            flag = false;
                            non_sales_retrun_flag = false
                            // break;
                        }
                    });
                }
            }
            if (non_sales_retrun_flag == false) {
                alert("Please Select all Checkbox for Non Sales Return")
            }
            
            if (current_tab == "Recipt-mismatch") {
                if (key == "update") {
                    $("#Recipt-mismatch").find("input[type=checkbox][name=check_flag]").each(function() {
                        if ($(this).prop("checked") == false) {
                            flag = false;
                            recipit_mismatch_flag = false
                            // break;
                        }
                    });
                }
            }
            if (recipit_mismatch_flag == false) {
                alert("Please Select all Checkbox for Mismatch");
            }
        }
        if (flag == true) {
            $("." + next_page).trigger('click');
        }
    });
});
$(document).on('change', '#vendor', function(e) {
    UpdateGSTInd();
    var vendor_id = $(this).val()
    var data = {
        "key": "vendor_based_brand_list",
        "vendor_id": vendor_id
    }
    $.ajax({
        url: "/vendor_based_brand_claims",
        type: 'POST',
        data: data,
        success: function(response) {
            var resp = '';
            if (response.status == 1) {
                $('#brand_name').html(response.value)
            } else {
                $('#brand_name').html('<option value="">--Select--</option>')
            }
        }
    });
});
$(document).on('change', '#brand_name', function(e) {
    // list_details();
});
$(document).on('blur', '#month_year', function(e) {
    list_details();
});
$(document).on('keyup', 'input[name="approved_amount"]', function(e) {
    $(this).closest('tr').children('td.approved_amount').children('.non-editable').html($(this).val());
});
$(document).on('click', '.submit', function(e) {
    var sales_retrun_flag = true;
    var non_sales_retrun_flag = true;
    var recipit_mismatch_flag = true;
    var flag = true;
    
    if ($("#checkbox_verfiy").val() == "yes") {
        $("#sales-return").find("input[type=checkbox][name=check_flag]").each(function() {
            if ($(this).prop("checked") == false) {
                flag = false;
                sales_retrun_flag = false
            }
        });
        $("#non-sales-return").find("input[type=checkbox][name=check_flag]").each(function() {
            if ($(this).prop("checked") == false) {
                flag = false;
                non_sales_retrun_flag = false
            }
        });
        $("#Recipt-mismatch").find("input[type=checkbox][name=check_flag]").each(function() {
            if ($(this).prop("checked") == false) {
                flag = false;
                recipit_mismatch_flag = false
            }
        });
        if (sales_retrun_flag == false) {
            $(".Sales_Return").trigger('click');
            alert("Please Select all Checkbox for Sales Return 2")
        } else if (non_sales_retrun_flag == false) {
            $(".Non_Sales_Return").trigger('click');
            alert("Please Select all Checkbox for Non Sales Return")
        } else if (recipit_mismatch_flag == false) {
            $(".Purchase_Reciept_Mismatch").trigger('click');
            alert("Please Select all Checkbox for Mismatch");
        }
    }
    if (flag == true) {
        $('.modal-aproval-by').modal('toggle');
        $('.modal-aproval-by').show();
    }
});
$(document).on('click', '.appovedby', function(e) {
    e.preventDefault();
    var key = $("#key").val();
    var comments = $("#comments").val();
    var claim_month_year = $("#month_year").val();
    var vendor_id = $("#vendor").find(":selected").val();
    var vendor_name = $("#vendor").find(":selected").attr('data-vendor_name');
    var claim_approved_date_time = $("#claim_approved_date_time").val();
    var claim_id = $("#claim_id").val();
    var brand_id = $("#brand_name").find(":selected").val();
    var brand_name = $("#brand_name").find(":selected").attr('data-brand_name');
    //  var claim_status = $("#claim_status").find(":selected").attr('claim_status'); 
    var claim_status = $("#claim_status").val();
    var approval_reason = $("#approval_reason").val().replace("\n", "").trim();
    var claim_approved_by = $("#claim_approved_by").val();
    var claim_reason = $("#claim_reason").val();
    var flag = true;
    var sales_list_Array = [];
    var nonsales_list_Array = [];
    var ReciptMismatch_Array = [];
    var other_claims_list_Array = [];
    var product_flag = false;
    $('table#sales-return tbody tr').each(function() {
        var prod_id = $(this).attr('id');
        var category_id = $(this).children('td.product_name').attr('data-category_id');
        var sgst_per = Number($(this).children('td.gst').attr('data-sgst_per'));
        var cgst_per = Number($(this).children('td.gst').attr('data-cgst_per'));
        var igst_per = Number($(this).children('td.gst').attr('data-igst_per'));
        var approved_amount = Number($(this).children('td.approved_amount').children('.editable').children().val());
        var igst_amount = Number($(this).children('td.app_amount_inc_tax').attr("data-a_igst_amount"));
        var sgst_amount = Number($(this).children('td.app_amount_inc_tax').attr("data-a_sgst_amount"));
        var cgst_amount = Number($(this).children('td.app_amount_inc_tax').attr("data-a_cgst_amount"));
        var approve_amt_inc_tax = Number($(this).children('td.app_amount_inc_tax').children('.editable').children().val());
        product_flag = true;
        sales_list_Array.push({
            "claim_item_id": prod_id,
            "category_id": category_id,
            "approval_amount": approved_amount,
            "approval_cgst": cgst_per,
            "approval_sgst": sgst_per,
            "approval_igst": igst_per,
            "approval_cgst_amount": cgst_amount,
            "approval_sgst_amount": sgst_amount,
            "approval_igst_amount": igst_amount,
            "approval_total_amount": approve_amt_inc_tax
        });
    });
    $('table#non-sales-return tbody tr').each(function() {
        var prod_id = $(this).attr('id');
        var category_id = $(this).children('td.product_name').attr('data-category_id');
        var sgst_per = Number($(this).children('td.gst').attr('data-sgst_per'));
        var cgst_per = Number($(this).children('td.gst').attr('data-cgst_per'));
        var igst_per = Number($(this).children('td.gst').attr('data-igst_per'));
        var approved_amount = Number($(this).children('td.approved_amount').children('.editable').children().val());
        var igst_amount = Number($(this).children('td.app_amount_inc_tax').attr("data-a_igst_amount"));
        var sgst_amount = Number($(this).children('td.app_amount_inc_tax').attr("data-a_sgst_amount"));
        var cgst_amount = Number($(this).children('td.app_amount_inc_tax').attr("data-a_cgst_amount"));
        var approve_amt_inc_tax = Number($(this).children('td.app_amount_inc_tax').children('.editable').children().val());
        nonsales_list_Array.push({
            "claim_item_id": prod_id,
            "category_id": category_id,
            "approval_amount": approved_amount,
            "approval_cgst": cgst_per,
            "approval_sgst": sgst_per,
            "approval_igst": igst_per,
            "approval_cgst_amount": cgst_amount,
            "approval_sgst_amount": sgst_amount,
            "approval_igst_amount": igst_amount,
            "approval_total_amount": approve_amt_inc_tax
        });
    });
    $('table#Recipt-mismatch tbody tr').each(function() {
        var prod_id = $(this).attr('id');
        var category_id = $(this).children('td.product_name').attr('data-category_id');
        var sgst_per = Number($(this).children('td.gst').attr('data-sgst_per'));
        var cgst_per = Number($(this).children('td.gst').attr('data-cgst_per'));
        var igst_per = Number($(this).children('td.gst').attr('data-igst_per'));
        var approved_amount = Number($(this).children('td.approved_amount').children('.editable').children().val());
        var igst_amount = Number($(this).children('td.app_amount_inc_tax').attr("data-a_igst_amount"));
        var sgst_amount = Number($(this).children('td.app_amount_inc_tax').attr("data-a_sgst_amount"));
        var cgst_amount = Number($(this).children('td.app_amount_inc_tax').attr("data-a_cgst_amount"));
        var approve_amt_inc_tax = Number($(this).children('td.app_amount_inc_tax').children('.editable').children().val());
        ReciptMismatch_Array.push({
            "claim_item_id": prod_id,
            "category_id": category_id,
            "approval_amount": approved_amount,
            "approval_cgst": cgst_per,
            "approval_sgst": sgst_per,
            "approval_igst": igst_per,
            "approval_cgst_amount": cgst_amount,
            "approval_sgst_amount": sgst_amount,
            "approval_igst_amount": igst_amount,
            "approval_total_amount": approve_amt_inc_tax
        });
    });
    $('table#other-claims tbody tr').each(function() {
        var prod_id = $(this).attr('id');
        var category_id = $(this).children('td.product-name').attr('data-category_id');
        var category_name = $(this).children('td.product-name').attr('data-category_name');
        var erp_code = $(this).attr('data-erp_code').trim();
        
        if(erp_code =="" || erp_code  == undefined || (erp_code == "undefined" )){
            
            erp_code =$(this).children('td.product-name').children('.editable').children().find(":selected").attr('data-erp_code');
            
        }
        if(category_name  == undefined || (category_name == "undefined" )){
            category_name =$(this).children('td.product-name').children(".non-editable").attr('data-other_claim_name');
        }
        var sgst_per = Number($(this).children('td.gst').attr('data-sgst_per'));
        var gst = Number($(this).children('td.gst').attr('data-gst'));
        var cgst_per = Number($(this).children('td.gst').attr('data-cgst_per'));
        var igst_per = Number($(this).children('td.gst').attr('data-igst_per'));
        var approved_amount = Number($(this).children('td.approved_amount').children('.editable').children().val());
        var igst_amount = Number($(this).children('td.app_amount_inc_tax').attr("data-a_igst_amount"));
        var sgst_amount = Number($(this).children('td.app_amount_inc_tax').attr("data-a_sgst_amount"));
        var cgst_amount = Number($(this).children('td.app_amount_inc_tax').attr("data-a_cgst_amount"));
        // var approve_amt_inc_tax = Number($(this).children('td.app_amount_inc_tax').html());
        var approve_amt_inc_tax = Number($(this).children('td.app_amount_inc_tax').children('.editable').children().val());
        var description = $(this).children('td.description').children('.editable').children().val();
        if(Number(approve_amt_inc_tax) >0){
            other_claims_list_Array.push({
                "claim_item_id": prod_id,
                "category_id": category_id,
                "category_name" : category_name,
                "erp_code" :erp_code,
                "description":description,
                "qty" : 1,
                "gst" : gst,
                "amount": approved_amount,
                "cgst": cgst_per,
                "sgst": sgst_per,
                "igst": igst_per,
                "cgst_amount": cgst_amount,
                "sgst_amount": sgst_amount,
                "igst_amount": igst_amount,
                "total_amount": approve_amt_inc_tax,
                "approval_amount": approved_amount,
                "approval_cgst": cgst_per,
                "approval_sgst": sgst_per,
                "approval_igst": igst_per,
                "approval_cgst_amount": cgst_amount,
                "approval_sgst_amount": sgst_amount,
                "approval_igst_amount": igst_amount,
                "approval_total_amount": approve_amt_inc_tax
            });
        }
    });
    var checkbox = allCheckedFlag();
    //alert(checkbox);
    sales_list_Array = JSON.stringify(sales_list_Array);
    nonsales_list_Array = JSON.stringify(nonsales_list_Array);
    ReciptMismatch_Array = JSON.stringify(ReciptMismatch_Array);
    other_claims_list_Array = JSON.stringify(other_claims_list_Array);
    var data = {
        "key": "update",
        "claim_id": claim_id,
        "claim_reason": claim_reason,
        "claim_status": claim_status,
        "approval_reason": approval_reason,
        "approval_emp_id": $("#approval_emp_id").val(),
        "incharge_status": $("#incharge_status").val(),
        sales_list_Array,
        nonsales_list_Array,
        ReciptMismatch_Array,
        other_claims_list_Array
    }
    // console.log(data)
    if (!vendor_id) {
        flag = false;
        alert("Please Select vendor");
    } else if (!brand_id) {
        flag = false;
        alert("Please Select Brand");
    } else if (!claim_month_year) {
        flag = false;
        alert("Please Select Claims Month");
    } else if (!approval_reason) {
        flag = false;
        alert("Please enter the reason ");
    }
    // else if(product_flag == false){
    //      flag = false;
    //     alert("add product with least quantity with valid Product"); 
    // }
    if (flag == true) {
        $('.modal-aproval-by').modal('toggle');
        $('.modal-aproval-by').hide();
        $(".loading").css("display", "block");
        $.ajax({
            url: "/claims_add",
            type: 'POST',
            dataType: "json",
            data: data,
            success: function(result) {
                //  console.log(result)
                $("#exportexcel").show();
                $(".loading").css("display", "none");
                if (result["status"] == 0) {
                    var respp = result["value"];
                    
                    alert(result["value"]);
                } else if (result["status"] == 1) {
                    var respp = result["value"];
                    alert(result["value"]);
                   
                    location.replace(window.location.origin + '/claims_list');
                }
            }
        });
    }
});
 
    $(document).on('click', '.add-row-other-claim', function(e) {
    AddRowItemList();
});
function AddRowItemList(){
    // ClearOverAllDiscount();
   // $(this).closest('tr').remove();
   $('.other-claim').find('td .non-editable').show();
    $('.other-claim').find('td .editable').hide();
   var add_flag =true;
   console.log("db")
   if(add_flag ==  true){
   var row = $('#other-item tr:last').html(); 
    var layout = '<tr class="tablevalues"  style="border-bottom:1px solid #ece4e4;" id="">  ';
                layout+=' <td  class="product-name" style="width: 34%;">';                                 
                layout+='                         <span class="editable" style="style:100%"></span>  ';
                layout+='                          <span class="non-editable" style="style:100%"></span> ';
                layout+='                  </td>';
                layout += "<td class='description'>" ;
                layout += '<span class="editable"><input type="text" autocomplete="off" class="form-control-invoice right"  name="description" value="" placeholder="" > </span>';
                layout += "<span class='non-editable'></span>";

                layout += "</td>";
                layout += "<td class='gst right'  data-gst='0' data-cgst_per='0' data-sgst_per='0' data-igst_per='0' >";
                layout += '<span class="editable"><input type="text" autocomplete="off" class="form-control-invoice right"  name="gst" value="0" placeholder=""></span>';
                layout += "<span class='non-editable'>0</span>";

                layout += "</td>";
                
                
               
				// layout += "<td class='claim_inc_tax right' data-cgst_amount='0' data-sgst_amount='0' data-igst_amount='0'>";
                // layout += '<span class="editable"><input type="text" autocomplete="off" class="form-control-invoice right"  name="claim_amount_inc_tax" value="0" placeholder="" ></span>';
                // layout += "<span class='non-editable'>0</span>";

                // layout += "</td>";
                layout += "<td class='approved_amount right' >";
                layout += "<span class='editable'><input type='text' autocomplete='off' disabled='disabled' class='form-control-invoice right'  name='approved_amount' style='width: 100px;' value=0' placeholder=''  ></span> <span class='non-editable'>0.00</span> </td>";
				
                layout += "<td class='app_amount_inc_tax right'   data-a_cgst_amount='0' data-a_sgst_amount='0' data-a_igst_amount='0' >";
                layout += "<span class='editable'><input type='text' autocomplete='off' class='form-control-invoice right'  name='approved_amount_input' style='width: 100px;' value='0' placeholder=''  ></span> <span class='non-editable'>0.00</span> </td>";

                // layout += "<td class='approved_amount right' style='width:8%;' >";
                // layout += "<span class='editable'><input type='text' autocomplete='off' class='form-control-invoice right'  name='approved_amount' style='width: 100px;' value='0' placeholder=''  ></span> <span class='non-editable'>0</span> </td>";
				// layout += "<td class='app_amount_inc_tax right' data-a_cgst_amount='0' data-a_sgst_amount='0' data-a_igst_amount='0' >" ;
                // layout += "<span class='editable'><input type='text' autocomplete='off' class='form-control-invoice right'  name='approved_amount_inc_tax' style='width: 100px;' value='0' placeholder=''  ></span>";
                // layout += "<span class='non-editable'>0</span>";

                layout += "</td>";
                layout += '<td class="right Other-Claim-action" style="">';
                //layout += '<span class="editable cancel-btn"><i class=" mdi mdi-content-save-move" title="save" style="font-size:20px ;"></i></span>'; 
              //  layout += '<span class="non-editable">';
                     
                //layout += '<i class=" ion-edit mdi mdi-square-edit-outline icon_views_listss icon_color eidt-btn" title="edit" style="font-size:20px ;"></i></span>';
                layout += '<i class="mdi  mdi-delete-circle remove-for-this-info" title="Remove this Product" style="font-size: 23px;"></i>';                        
                layout += ' </td>';
                
                layout += '</tr>';
                
                $('table.other-claim tbody').append(layout);

                var product_options = $('#loaded-product').html();
           
                var no_of_combo =$("#no_of_combo").val();
                no_of_combo++;
                $("#no_of_combo").val(no_of_combo);
                //$('#invoice-item tr:last').find(':text').val('');
                var select_id = "product_name"+$("#no_of_combo").val();
                var te= '<select class=" form-control "  style="width:100%" name="client_name" id="'+select_id+'" >'+product_options+'</select>';
            // var te= ' <select class="select2 form-control custom-select" data-toggle="select2" name="beat_name" id="beat_name1" ><option value="">--Select--</option><option value="82`vnr">vnr</option><option value="413`sivakasi">sivakasi</option></select>';
                $('.other-claim tr:last').children('.product-name').children('.editable').html(te);
                $("#"+select_id).select2({  width: '100%',
                });
                $('.other-claim  ').find('td .non-editable').hide();
               $('.other-claim').find('td .editable').show();
}
}
$(document).on('select2:select', '[id^="product_name"]', function(e) { 
    var other_claim_id = $(this).find(":selected").attr('data-other_claim_id');
    var erp_code = $(this).find(":selected").attr('data-erp_code');
    
    var other_claim_name = $(this).find(":selected").attr('data-other_claim_name');
    
    var obj = $(this).closest("tr");
    var exit_flag=false;
        $('table#other-claims tbody tr').each(function(){     
            // var erp_code = $(this).children('td.erp_code').children('.editable').children().val();
            id= $(this).closest('tr').children("td.product-name").attr("data-category_id");
            if(id == other_claim_id){
                exit_flag = true;
            }
        })
    if(exit_flag  == false){
        // alert(erp_code);
        $(this).closest('tr').attr("data-erp_code",erp_code);
        $(this).closest('tr').children('td.product-name').attr('data-category_id',other_claim_id);
        $(this).closest('tr').children('td.product-name').attr('data-category_name',other_claim_name);
        $(this).closest('tr').children('td.product-name').children('.non-editable').html(other_claim_name);
        $(this).closest('tr').children('td.product-name').children('.non-editable').attr("data-other_claim_id",other_claim_id);
    }else{
        alert("Already added this Claim Name");
        $(this).val("").trigger("change.select2"); 
    }

        // $('table tbody tr').each(function(){     
        //     var prod_item_free_parent_category_id = $(this).closest('tr').attr("data-prod_item_free_parent_category_id");
        //     var free_ind = $(this).closest('tr').attr("data-prod_item_free_ind");
            
        //     if(free_ind =="0" || free_ind == "" || free_ind ==undefined){
        //         free_ind ="0";
        //     }
        //     if(free_ind == 1)
        //     {
        //         var parent_product_exist_flag=false;
        //         $('table tbody tr').each(function(){     
        //             var free_ind = $(this).closest('tr').attr("data-prod_item_free_ind");
        //             if(free_ind =="0" || free_ind == "" || free_ind ==undefined){
        //                 var category_id= $(this).closest('tr').children('td.product-name').children('.non-editable').attr("data-category_id");
        //                 if(category_id  ==prod_item_free_parent_category_id){
        //                     parent_product_exist_flag =true
        //                 }
        //             }
        //         })
        //         if(parent_product_exist_flag == false){
        //             $(this).closest('tr').remove();
        //         }
        //     }
        // })
                   
        without_tax($(this).closest('tr'));
});
$(document).on('click', '.eidt-btn', function(e) {  
    $('.other-claim').find('td .non-editable').show();
    $('.other-claim').find('td .editable').hide();
    var product_options = $('#loaded-product').html();
    var product_combo_id = $(this).closest('tr').children('td.product-name').children('.editable').children().attr("id");
    var other_claim_id = $(this).closest('tr').children('td.product-name').children('.non-editable').attr("data-other_claim_id");
    
    $("#"+product_combo_id).html(product_options)
     $("#"+product_combo_id).select2({  width: '100%'});
    $("#"+product_combo_id).val(other_claim_id).trigger('change');
    $(this).closest('tr').find('td .editable').show();
    
    $(this).closest('tr').find('td .non-editable').hide();
});
$(document).on('click', '.remove-for-this-info ', function(e) {  
    $(this).closest('tr').remove();
    tot_amount_Cal_otherclaims($("table#other-claims"));
    
});
$(document).on('click', '.cancel-btn', function(e) {  
    $(this).closest('tr').find('td .editable').hide();
     $(this).closest('tr').find('td .non-editable').show();

    // var gst = $(this).closest('tr').children('td.gst').children('.editable').children().val();
    // if(qty > 0){ 
    //  $(this).closest('tr').find('td .editable').hide();
    //  $(this).closest('tr').find('td .non-editable').show();
    // }
    // }else{
    //     alert("Atlest need to Min Quantity of this Product");
    // }
});
$(document).on('keyup', 'input[name=claim_amount] ', function(e) {
    var claim_amount = obj.children('td.claim_amount').children('.editable').children().val();
      obj.children('td.claim_amount').children('.non-editable').html(claim_amount);
   // var gst = obj.children('td.gst').children('.editable').children().val();
//    if(!qty) {qty = 0 ;}
//    var  tot =unit_price *qty;
//    obj.children('td.qty').children('.amount').html(tot);
 });
function list_details() {
    var brand_id = $('#brand_name').val();
    var month_year = $('#month_year').val();
    var vendor_gst = $("#vendor").find(":selected").attr('data-vendor_gst');
    var vendor_state_code = $("#vendor").find(":selected").attr('data-vendor_state_code');
    var data = {
        "key": "product_list",
        "brand_id": brand_id,
        "month_year": month_year,
        "vendor_state_code": vendor_state_code,
        "vendor_gst": vendor_gst
    }
    $.ajax({
        url: "/brand_based_product_list",
        type: 'POST',
        data: data,
        success: function(response) {
            console.log(response)
            var resp = '';
            // if(response.status == 1)
            // {
            $('.SalesReturnTable').html(response.SalesReturnTable)
            $('.NonSalesReturnTable').html(response.NonSalesReturnTable)
            $('.ReciptMismatchTable').html(response.ReciptMismatchTable)
            $('.otherClaimsTable').html(response.otherClaimsTable)
            // }else{
            //     $('#brand_name').html('<option value="">--Select--</option>')
            // }
            $('#claims-item').find('td .editable').show();
            $('#claims-item').find('td .non-editable').hide();
        }
    });
    // show_hide();
}

function UpdateGSTInd() {
    var true_flag = true;
    var dist_true_flag = true;
    var vendor_gst_no = $("#vendor").find(":selected").attr("data-vendor_gst");
    vendor_gst_no = vendor_gst_no.trim();
    var vendor_state_code = $("#vendor").find(":selected").attr("data-vendor_state_code");
    if (vendor_gst_no == null || vendor_gst_no == undefined) {
        vendor_gst_no = "";
    }
    var dist_billing_gst_no = $("#dist_gst_no").val();
    var cgst_sgst_flag = 0;
    var igst_flag = 0;
    var vendor_gst_state_code = 0;
    var dist_gst_state_code = 0;
    if ((dist_billing_gst_no == "undefined") || (dist_billing_gst_no == null) || (dist_billing_gst_no == "")) {
        true_flag = false;
        dist_true_flag = true;
    } else {
        dist_gst_state_code = dist_billing_gst_no.substring(0, 2);
        if (isNaN(dist_gst_state_code) == true) {
            true_flag = false;
            dist_true_flag = true;
        }
    }
    //if  ((shop_billing_gst_no  != "undefined") || (shop_billing_gst_no != null)  || (shop_billing_gst_no != ""))
    if ((vendor_gst_no != "undefined") && (vendor_gst_no != null) && (vendor_gst_no != "") && (vendor_gst_no != " ")) {
        vendor_gst_state_code = vendor_gst_no.substring(0, 2);
        if (isNaN(vendor_gst_state_code) == true) {
            true_flag = false;
        }
    } else {
        vendor_gst_state_code = vendor_state_code;
        if (isNaN(vendor_gst_state_code) == true) {
            true_flag = false;
        }
    }
    if (true_flag == true) {
        if (dist_gst_state_code == vendor_gst_state_code) {
            cgst_sgst_flag = 1;
        } else {
            igst_flag = 1;
        }
    }
    $("#cgst_sgst_flag").val(cgst_sgst_flag);
    $("#igst_flag").val(igst_flag);
}

function NumberFormet(amount) {
    // amount=Number(amount.replace(/\₹/g,''));
    amount = Number(amount.toString().replace(/\,/g, '').replace(/\₹/g, ''));
    return amount;
}

function ChangeDateFormetDDMMYYY(data) {
    var fleet_megment_date;
    if (data == null || data == "null" || data == undefined || data == '-' || data == "undefined" || data == '' || data == 'Infinity' || data == 'infinity') {
        fleet_megment_date = '-';
    } else {
        if (moment(data, "DD/MM/YYYY hh:mm A", true).isValid()) {
            fleet_megment_date = data;
        } else {
            fleet_megment_date = moment(data).format('DD/MM/YYYY hh:mm A');
        }
        //fleet_megment_date = data;
    }
    return fleet_megment_date;
}

function NumberToCurrecyForment(amount, currency_sym = "") {
    amount = amount.toString().replace(/(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g, "$1,").toString();
    if (currency_sym == "No") {} else {
        amount = "₹" + amount
    }
    return amount;
}

function CurrencyToNumberForment(amount) {
    // amount=Number(amount.replace(/\₹/g,''));
    amount = Number(amount.toString().replace(/\,/g, '').replace(/\₹/g, ''));
    return amount;
}
$(document).on('keypress', "input[name=approved_amount]", function(evt) {
    // alert(evt.which);
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode != 46) && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
});
$(document).on('keypress', "input[name=approved_amount]", function(evt) {
    // alert(evt.which);
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode != 46) && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
});
$(document).on('keyup', "input[name=approved_amount]", function(evt) {
    var appoved = Number($(this).closest('tr').children('td.approved_amount').children('.editable').children().val());
    var claim_amount = Number($(this).closest('tr').children('td.amount').html());
    if (claim_amount <= appoved) {
        alert("This Approval Amount is Greater than Claim Amout")
        // if(conf("Approval Amount is Greater then Claim Amout,\n Are you sure to proceed?"))
        // {
        // }else
        // {
        //     tot_amount_Cal_otherclaims($(this).closest('tr'));
        // }
    }
});
$(document).on('keyup', "input[name=approved_amount_input]", function(evt) {
    var amt = Number($(this).closest("tr").children("td.claim_inc_tax").html())
    if (Number($(this).val()) > amt) {
        without_tax($(this).closest('tr'));
    }
    var table_name = $(this).closest('table').attr("id")
    if(table_name !=="other-claims")
    {
        checkdis($(this).closest("tr"));
    }
})
function checkdis(obj){
    var amt = Number(obj.closest("tr").children("td.claim_inc_tax").html())
    var amt_input = Number(obj.closest("tr").children("td.app_amount_inc_tax").children(".editable").children().val())
    if (Number(amt_input) > amt) {
        // /alert("Approval Amount should not greater than Claim Amount");
        // $(this).val(amt);
        // alert("ff")
        obj.closest("tr").children("td.app_amount_inc_tax").children(".editable").children().css("background-color","#c9ffb6")
       // without_tax($(this).closest('tr'));
        //  $(this).focus();
    }else if(Number(amt_input) == amt){
        // alert("eq")
        obj.closest("tr").children("td.app_amount_inc_tax").children(".editable").children().css("background-color","")
    }
    else{
        // alert("el")
        obj.closest("tr").children("td.app_amount_inc_tax").children(".editable").children().css("background-color","#ffc1cc")
    }

}

$(document).on('keypress', "input[name=approved_amount_input]", function(evt) {
    // alert(evt.which);
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode != 46) && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
});
$(document).on('click', '.reason-popup', function(e) {
    var reason = $(this).parent("td").children("span.reason_td").html();
    //   alert($(this).parent("td").html());
    $(".reason_desc").html(reason);
    $('.modal-reason').modal('toggle');
    $('.modal-reason').show();
});
$(document).on('click', '.sales-popup', function(e) {
    e.preventDefault();
    var claim_id = $("#claim_id").val();
    $("#product-name-title").html($(this).attr("data-title_name")+" ");
    var filter_value =$(this).attr("data-filter_value");
    var filter_type =$(this).attr("data-filter_type");
    var flag = true;
    var data = {    
        "claim_id":claim_id,
        
        "filter_type":filter_type,
        "filter_value":filter_value
    }
    
    
     
        $(".loading").css("display", "block");
        $.ajax({
            url: "/return_based_list",
            type: 'POST',
            dataType: "json",
            data: data,
            success: function(result) {
                //  console.log(result)
                $(".loading").css("display", "none");
                if (result["status"] == 0) {
                    var respp = result["value"];
                    if(typeof respp == "object"){
                        respp = JSON.stringify(respp);
                    }
                    
                } else if (result["status"] == 1) {
                    var table_layout = result["table_layout"];
                    $(".table_layout").html(table_layout);
                    
                    $('.modal-sales').modal('toggle');
                    $('.modal-sales').show();
                    $("."+result["filter_type"]+"_tab_click").trigger('click');
                }
                
            }
        });
    

});
$(document).on('click', '.other-claim-remove-all-tr', function(e) {
   $("#other-claims  tbody").html("");
   overallCalculation($("#other-claims"));
});
$(document).on('keyup', "input[name=approved_amount_input]", function(evt) {
    //var appoved = Number($(this).closest('tr').children('td.app_amount_inc_tax').children('.editable').children().val());
    //var claim_amount = Number($(this).closest('tr').children('td.amount').html());
    //if(claim_amount <= appoved){
    //  alert("This Approval Amount is Greater then Claim Amout")
    // if(conf("Approval Amount is Greater then Claim Amout,\n Are you sure to proceed?"))
    // {
    // }else
    // {
    //     tot_amount_Cal_otherclaims($(this).closest('tr'));
    // }
    //}
    without_tax($(this).closest('tr'));
});
$(document).on('keyup', "input[name=gst]", function(evt) {
    if(Number($(this).val())< 100){
    }else{
        alert("Invalid GST")
        $(this).val(0);
    }
     gst = $(this).val();
     $(this).closest('td.gst').attr("data-gst",gst);
    if($("#igst_flag").val() == 1) {
        $(this).closest('td.gst').attr("data-igst_per",gst);
    } else {
        $(this).closest('td.gst').attr("data-cgst_per",(gst/2));
        $(this).closest('td.gst').attr("data-sgst_per",(gst/2));
    }
    without_tax($(this).closest('tr'));
   
});

function without_tax(obj) {
    // alert()
    var val = Number(obj.children('td.app_amount_inc_tax').children(".editable").children().val());
    var gst = Number(obj.children('td.gst').attr("data-gst"));
     //alert("gst"+gst)
     
    
    var without_tax = val / (1 + (gst / 100));
    without_tax = without_tax.toFixed(2);
    var igst_flag = $("#igst_flag").val();
    var a_igst_val = 0
    var a_cgst_val = 0
    var a_sgst_val = 0
    if (igst_flag == 1) {
        var a_igst_val = (gst * without_tax) / 100;
        tot_amount = a_igst_val + without_tax;
    } else {
        var a_cgst_val = ((gst / 2) * without_tax) / 100;
        var a_sgst_val = ((gst / 2) * without_tax) / 100;
    }
    // tot_amount = a_igst_val + a_cgst_val + a_sgst_val + without_tax;
    // tot_amount = tot_amount.toFixed(2);
    obj.children('td.approved_amount').children(".editable").children().val(without_tax);
    obj.children('td.app_amount_inc_tax').attr("data-a_igst_amount", a_igst_val)
    obj.children('td.app_amount_inc_tax').attr("data-a_cgst_amount", a_cgst_val)
    obj.children('td.app_amount_inc_tax').attr("data-a_sgst_amount", a_sgst_val)
    overallCalculation(obj);
}

function allCheckedFlag() {
    var flag_tag = true;
    $('input[type=checkbox][name=check_flag]').each(function() {
        if ($(this).prop("checked") == false) {
            flag_tag = false;
            // break;
        }
    });
    return flag_tag;
} 
var tablesToExcel = (function() {
var uri = 'data:application/vnd.ms-excel;base64,'
, tmplWorkbookXML = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
  + '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>Axel Richter</Author><Created>{created}</Created></DocumentProperties>'
  + '<Styles>'
  + '<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>'
  + '<Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>'
  + '<Style ss:ID="Header"><ss:Font ss:Color="#ffffff"/><Interior ss:Color="#0066CC" ss:Pattern="Solid"/></Style>'
  + '<Style ss:ID="SecHeader"><Interior ss:Color="#FFCC99" ss:Pattern="Solid"/></Style>'
// + '<Style ss:ID="title"><Alignment ss:Horizontal="Center" ss:Vertical="Bottom"/><Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000" ss:Bold="1"/></Style>' 
  + '</Styles>' 
  + '{worksheets}</Workbook>'
, tmplWorksheetXML = '<Worksheet ss:Name="{nameWS}"><Table>{rows}</Table></Worksheet>'
, tmplCellXML = '<Cell{attributeStyleID}{cellmerg}{attributeFormula}><Data ss:Type="{nameType}">{data}</Data></Cell>'
, base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
, format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
return function(tables, wsnames, wbname, appname) {
  var ctx = "";
  var workbookXML = "";
  var worksheetsXML = "";
  var rowsXML = "";

  var table_length = tables.length;
       
       //table_length=8;
  for (var i = 0; i < table_length; i++) {
    // for (var i = 0; i < 8; i++) {
      if(i==0){
        rowsXML += '<Row >'
        rowsXML +=format(' <Cell><Data  ss:Type="String">Vandor Name :</Data></Cell>');
        rowsXML +=format(' <Cell><Data  ss:Type="String">'+$("#vendor").find(":selected").attr('data-vendor_name')+'</Data></Cell>');
        //    rowsXML +=format(' <Cell><Data  ss:Type="String"></Data></Cell>');
        rowsXML += '</Row>'
        rowsXML += '<Row   >'
        rowsXML +=format('   <Cell><Data  ss:Type="String">Brand Name :</Data></Cell>');
        rowsXML +=format(' <Cell><Data  ss:Type="String">'+$("#brand_name").find(":selected").attr('data-brand_name')+'</Data></Cell>');

        rowsXML += '</Row>'
        rowsXML += '<Row   >'
        rowsXML +=format('   <Cell><Data  ss:Type="String">Dist Name :</Data></Cell>');
        rowsXML +=format(' <Cell><Data  ss:Type="String">'+$("#dist_name").val()+'</Data></Cell>');
        rowsXML += '</Row>'
        rowsXML += '<Row   >'
        rowsXML +=format('   <Cell><Data  ss:Type="String">Claim Month :</Data></Cell>');
        rowsXML +=format(' <Cell><Data  ss:Type="String">'+$("#month_year").val()+'</Data></Cell>');
        rowsXML += '</Row>'
        rowsXML += '<Row   >'
        rowsXML +=format('   <Cell><Data  ss:Type="String">Status:</Data></Cell>');
        rowsXML +=format(' <Cell><Data  ss:Type="String">'+$("#claim_status").val()+'</Data></Cell>');
        rowsXML += '</Row>'
    }
        if (!tables[i].nodeType) tables[i] = document.getElementById(tables[i]);
        for (var j = 0; j < tables[i].rows.length; j++) {
        
        rowsXML += '<Row   >'
            // console.log(tables[i].rows[j].cells.length);
        for (var k = 0; k < tables[i].rows[j].cells.length; k++) {
            var td_flag=  true;
                var cell =tables[i].rows[j].cells[k];
                //  if( j >1  ){
                //             td_flag = false;
                //  }
                if( j ==0){
                        if(i ==1 ){
                            if(k<5){ // Sales Return
                            }else{
                                td_flag = false;    
                            }
                            
                        }
                        if((i ==2 ) && (k ==15 || k ==13)){ // Sales Return
                            td_flag = false;
                        }
                        if((i ==3 ) && (k ==16 || k ==14)){ // Sales Return
                            td_flag = false;
                        }
                        if((i ==4 ) && (k ==10 || k ==12)){ // Sales Return
                            td_flag = false;
                        }
                        if((i ==5 ) && (k ==5 )){ // Sales Return
                            td_flag = false;
                        }
                }
                if( j >0){
                        if(i ==1 ){
                            if(k<5){ // Sales Return
                                if(k==4){
                                    cell =cell.children[0]; 
                                    
                                }
                            }else{
                                td_flag = false;    
                            }
                            
                        }
                                        
                        if((k==1 && i==2) &&(k==2 && i==2)&&(k==3 && i==2) ||( k==1 && i==3) &&(k==2 && i==3) &&(k==3 && i==3)  ){ // Return Status
                            cell =cell.children[0]; 
                        }
                        // if((k==10 && i ==2)){ 
                        //      cell =cell.children[1]; 
                        //  }
                        if((k==14 && i ==2)||(k==15 && i ==3) ||(k==11 && i ==4)){ 
                            cell =cell.children[1]; 
                        }
                        if( i==5 ){ // Return Status
                            cell =cell.children[1]; 
                        }
                        if((i ==2 ) && (k ==15 || k ==13)){ // Sales Return
                            td_flag = false;
                            
                        }
                        if((i ==3 ) && (k ==16 || k ==14)){ // Sales Return
                            td_flag = false;
                        }
                        if((i ==4 ) && (k ==10 || k ==12)){ // Sales Return
                            td_flag = false;
                        }
                        if((i ==5 ) && (k ==5 )){ // Sales Return
                            td_flag = false;
                        }
                }
                
                    if(td_flag){
                        var dataType = cell.getAttribute("data-type");
                        var dataStyle = cell.getAttribute("data-style");
                        var dataValue = cell.getAttribute("data-value");
                        var colsp = cell.getAttribute("colspan");
                        dataValue = (dataValue)?dataValue:cell.innerHTML;
                        if( j == 0){
                            dataValue =dataValue.replace("<br>","");
                            dataValue =dataValue.replace("</br>","");
                            
                        }
                        if(dataType=='Number'){
                            dataValue = CurrencyToNumberForment(dataValue);
                        }
                        if(colsp == 2){
                            colsp=1;
                        }else{
                            colsp="";
                        }
                        //dataValue+=" K::"+k+" i::"+i+" ;;"
                        var dataFormula = tables[i].rows[j].cells[k].getAttribute("data-formula");
                        dataFormula = (dataFormula)?dataFormula:(appname=='Calc' && dataType=='DateTime')?dataValue:null;
                        ctx  = {  attributeStyleID: (dataStyle=='Currency' || dataStyle=='SecHeader'  ||dataStyle=='Header' || dataStyle=='Date')?' ss:StyleID="'+dataStyle+'"':''
                                ,cellmerg: (colsp=='1')?' ss:MergeAcross="'+colsp+'"':''
                            , nameType: (dataType=='Number' || dataType=='DateTime' || dataType=='Boolean' || dataType=='Error')?dataType:'String'
                            , data: (dataFormula)?'':dataValue
                            , attributeFormula: (dataFormula)?' ss:Formula="'+dataFormula+'"':''
                            };
                        rowsXML += format(tmplCellXML, ctx);
                    }
        }
        rowsXML += '</Row>'
        }
        if(i==0){
            
            var wiseclaim_table=  document.getElementById("dist-wiseclaim");
            rowsXML += '<Row   >'
                rowsXML += '</Row   >'
                rowsXML += '<Row   >'
                rowsXML += '</Row   >'
            for (var j = 0; j < wiseclaim_table.rows.length; j++) {
                
                rowsXML += '<Row   >'
                
                for (var k = 0; k < wiseclaim_table.rows[j].cells.length; k++) {
                var td_flag=  true;
                    var cell =wiseclaim_table.rows[j].cells[k];
                        if(td_flag){
                            var dataType = cell.getAttribute("data-type");
                            var dataStyle = cell.getAttribute("data-style");
                            var dataValue = cell.getAttribute("data-value");
                            var colsp = cell.getAttribute("colspan");
                            dataValue = (dataValue)?dataValue:cell.innerHTML;
                            if( j == 0){
                                dataValue =dataValue.replace("<br>","");
                                dataValue =dataValue.replace("</br>","");
                                
                            }
                            if(dataType=='Number'){
                                dataValue = CurrencyToNumberForment(dataValue);
                            }
                            if(colsp == 2){
                                colsp=1;
                            }else{
                                colsp="";
                            }
                            //dataValue+=" K::"+k+" i::"+i+" ;;"
                            var dataFormula = wiseclaim_table.rows[j].cells[k].getAttribute("data-formula");
                            dataFormula = (dataFormula)?dataFormula:(appname=='Calc' && dataType=='DateTime')?dataValue:null;
                            ctx  = {  attributeStyleID: (dataStyle=='Currency' || dataStyle=='SecHeader'  ||dataStyle=='Header' || dataStyle=='Date')?' ss:StyleID="'+dataStyle+'"':''
                                    ,cellmerg: (colsp=='1')?' ss:MergeAcross="'+colsp+'"':''
                                , nameType: (dataType=='Number' || dataType=='DateTime' || dataType=='Boolean' || dataType=='Error')?dataType:'String'
                                , data: (dataFormula)?'':dataValue
                                , attributeFormula: (dataFormula)?' ss:Formula="'+dataFormula+'"':''
                                };
                            rowsXML += format(tmplCellXML, ctx);
                        }
            }
        
                rowsXML += '</Row   >'
            }
        }

    ctx = {rows: rowsXML, nameWS: wsnames[i] || 'Sheet' + i};
    worksheetsXML += format(tmplWorksheetXML, ctx);
    rowsXML = "";
  }

  ctx = {created: (new Date()).getTime(), worksheets: worksheetsXML};
  workbookXML = format(tmplWorkbookXML, ctx);

 console.log(workbookXML);

  var link = document.createElement("A");
  link.href = uri + base64(workbookXML);
  link.download = wbname || 'Workbook.xlxs';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
})();