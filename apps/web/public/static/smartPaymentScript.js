// Include the PayPal JavaScript SDK
import "./paypal-js.min.js/index.js";

let scriptElement = document.getElementById("paypal-smart-payment-script");
let clientId = scriptElement.getAttribute("data-client-id");
let clientToken = scriptElement.getAttribute("data-client-token");
let currency = scriptElement.getAttribute("data-currency");
let appendTrailingSlash = scriptElement.getAttribute(
    "data-append-trailing-slash"
);
let locale = scriptElement.getAttribute("data-locale");
let sandbox = scriptElement.getAttribute("sandbox");

let shippingOptionsGetCount = 0;
let shippingOptionsOperation = "add";
let referenceId = "default";

// smart button logic (different pages)
window.resolveAfterItemAddedToBasket = function resolveAfterItemAddedToBasket(
    btnId
) {
  return new Promise((resolve, reject) => {
    try {
      var btn = $("#paypal-button-container_" + btnId);
      if (
          btn.parents(".main").length >= 1 &&
          document.querySelector(".add-to-basket-container > button") != undefined
      ) {
        if (
            document
                .querySelector(".add-to-basket-container > button")
                .classList.contains("disabled")
        ) {
          reject();
        }
        document.querySelector(".add-to-basket-container > button").click();
        document.addEventListener(
            "afterBasketItemAdded",
            async function (e) {
              if (document.querySelector("#add-item-to-basket-overlay")) {
                const modal = document.querySelector(
                    "#add-item-to-basket-overlay > div"
                );
                modal.classList.remove("show");
                modal.setAttribute("aria-hidden", "true");
                modal.setAttribute("style", "display: none");

                // get modal backdrop
                const modalBackdrops = document.getElementsByClassName(
                    "modal-backdrop"
                );
                // remove opened modal backdrop
                if (modalBackdrops.length > 0) {
                  document.body.removeChild(modalBackdrops[0]);
                }
              }
              resolve();
            },
            {
              once: true,
            }
        );
      } else {
        resolve();
      }
    } catch (e) {
      reject();
    }

    window.setTimeout(function () {
      // Reject fallback
      reject();
    }, 100000);
  });
};

window.renderPayPalButtons = function renderPayPalButtons(
    btnId,
    foundingSource,
    buttonLabel = "paynow",
    shape = "rect",
    color = "gold"
) {
  // Render the PayPal button into #paypal-button-container 1
  if(paypal_plenty_sdk.isFundingEligible(foundingSource)) {
    paypal_plenty_sdk
        .Buttons({
          // Call your server to set up the transaction
          createOrder: function (data, actions) {
            shippingOptionsOperation = 'add';
            shippingOptionsGetCount = 0;
            return resolveAfterItemAddedToBasket(btnId)
                .then(() => {
                  return fetch(
                      "/rest/payment/payPal/smart_payment/create/" +
                      foundingSource +
                      (appendTrailingSlash ? "/" : ""),
                      {
                        method: "post",
                      }
                  )
                      .then(function (res) {
                        return res.json();
                      })
                      .then(function (orderData) {
                        referenceId = orderData.referenceId;
                        if(orderData.id) {
                          return orderData.id;
                        } else {
                          location.reload();
                        }
                      });
                })
                .catch((e) => {
                  console.log(e);
                });
          },
          onShippingChange: function(data, actions) {

            let selectedShippingOptionId = undefined;
            if (data.selected_shipping_option) {
              selectedShippingOptionId = data.selected_shipping_option.id;
            }
            let formData = new FormData();
            formData.append('defaultShippingOptionId', selectedShippingOptionId);
            formData.append('countryCode', data.shipping_address.country_code);

            return fetch(
                "/rest/payment/payPal/shipping_options" +
                (appendTrailingSlash ? "/" : ""),
                {
                  method: "post",
                  body: formData
                })
            .then(function(res) {return res.json();})
            .then(function (response) {
              if(response.shippingOptions.options) {
                if (shippingOptionsGetCount > 0){
                  shippingOptionsOperation = "replace";
                }
                let request = [
                  {
                    op: shippingOptionsOperation,
                    path: "/purchase_units/@reference_id=='"+ referenceId + "'/shipping/options",
                    value: response.shippingOptions.options
                  },
                  {
                    op: "replace",
                    path: "/purchase_units/@reference_id=='"+ referenceId + "'/amount",
                    value: {
                      breakdown: {
                        item_total: {"currency_code": response.currencyCode, "value":response.itemTotal},
                        tax_total: {"currency_code": response.currencyCode, "value": response.taxTotal},
                        shipping: {"currency_code": response.currencyCode,"value": response.defaultShippingOptionCost},
                        shipping_discount: {"currency_code": response.currencyCode, "value": response.basketDiscount}
                      },
                      currency_code: response.currencyCode,
                      value: response.totalValue
                    }
                  }
                ];
                actions.order.patch(request).then(function (result){
                  shippingOptionsGetCount++;
                  return result;
                }).catch(function (err){
                  console.log('error while patching shipping options', err);
                  return actions.reject();
                });
              } else {
                return actions.reject();
              }
            });
            return actions.resolve();
          },
          // Call your server to finalize the transaction
          onApprove: function (data, actions) {
            return fetch(
                "/rest/payment/payPal/smart_payment/" +
                data.orderID +
                "/" +
                data.payerID +
                "/capture" +
                (appendTrailingSlash ? "/" : ""),
                {
                  method: "post",
                }
            )
                .then(function (res) {
                  return res.json();
                })
                .then(function (orderData) {
                  window.location.href = orderData.url;
                });
          },

          style: {
            shape: shape,
            color: color,
            label: buttonLabel,
          },
          fundingSource: foundingSource,
        })
        .render("#paypal-button-container_" + btnId);
  }
};

// Checkout logic
window.renderSmartPaymentButton = function renderSmartPaymentButton(
    smartMethod,
    labelStyle,
    btnColor,
    btnColorPayLater = "gold",
    payLaterActive = false
) {
  $(".paypal-checkout-button-container").each(function (i, btnContainer) {
    let checkoutButton = $(btnContainer)
        .parent()
        .find("div > button.btn.btn-block")
        .css("display", "none");

    $(btnContainer).html("").css("display", "block");
    renderButton(smartMethod, $(btnContainer).attr("id"), labelStyle, btnColor);
    if (smartMethod == "paypal" && payLaterActive) {
      // If the paypal button is rendered we have to render the pay later button at the same time
      renderButton(
          "paylater",
          $(btnContainer).attr("id"),
          labelStyle,
          btnColorPayLater
      );
    }
  });
};

window.renderButton = function renderButton(
    smartMethod,
    bttId,
    labelStyle,
    btnColor = "black"
) {
  var value;
  if(paypal_plenty_sdk.isFundingEligible(smartMethod))
  {
    paypal_plenty_sdk.Buttons({
      onInit: function (data, actions) {
      },

      onClick: function (data, actions) {
        value = data.fundingSource;
        return paypalValidateCheckout().
        then(function (data) {
          $("#paypal_loading_screen").css("display", "block");
          return actions.resolve();
        }).catch((e) => {
          return actions.reject();
        })
      },

      // Call your server to set up the transaction
      createOrder: function (data, actions) {
        return fetch(
            "/rest/payment/payPal/smart_payment/create_order" +
            (appendTrailingSlash ? "/" : ""),
            {
              method: "post"
            }
        ).then(function (res) {
          return res.json();
        }).then(function (orderData) {
          if (orderData.id) {
            if (value !== "card") {
              $("#paypal_loading_screen").css("display", "block");
            } else {
              $("#paypal_loading_screen").css("display", "none");
            }
            return orderData.id;
          } else {
            location.reload();
          }
        });
      },

      // Call your server to finalize the transaction
      onApprove: function (data, actions) {
        return fetch(
            "/rest/payment/payPal/smart_payment/" +
            data.orderID +
            "/" +
            data.payerID +
            "/capture_order" +
            (appendTrailingSlash ? "/" : ""),
            {
              method: "post",
            }
        ).then(function (res) {
          return res.json();
        }).then(function (orderData) {
          $("#paypal_loading_screen").css("display", "block");
          window.location.href = orderData.url;
        });
      },
      onCancel: function (data) {
        $("#paypal_loading_screen").css("display", "none");
      },
      style: {
        label: labelStyle,
        color: btnColor,
      },
      fundingSource: smartMethod,
    }).render("#" + bttId);
  }
};

window.showCheckoutButton = function showCheckoutButton() {
  $(".paypal-checkout-button-container").each(function () {
    $(this).css("display", "none");
    $(this).parent().find("div > button.btn.btn-block").css("display", "block");
  });
};

// MyAccount & Confirmation logic
window.renderReinitSmartButton = function renderReinitSmartButton(
    smartMethod,
    orderId,
    labelStyle,
    btnColor
) {
  renderReinitButton(smartMethod, orderId, labelStyle, btnColor);
};

window.renderReinitButton = function renderReinitButton(
    smartMethod,
    orderId,
    labelStyle,
    btnColor = "black"
) {
  var value;
  if(paypal_plenty_sdk.isFundingEligible(smartMethod)) {
    paypal_plenty_sdk.Buttons({
      onInit: function (data, actions) {
      },
      onClick: function (data, actions) {
        value = data.fundingSource;
        $("#paypal_loading_screen").css("display", "block");
      },

      // Call your server to set up the transaction
      createOrder: function (data, actions) {
        return fetch(
            "/rest/payment/payPal/smart_payment/" +
            orderId +
            "/reinit_create_order" +
            (appendTrailingSlash ? "/" : ""),
            {
              method: "post",
            }
        ).then(function (res) {
          return res.json();
        }).then(function (orderData) {
          if (orderData.id) {
            if (value !== "card") {
              $("#paypal_loading_screen").css("display", "block");
            } else {
              $("#paypal_loading_screen").css("display", "none");
            }
            return orderData.id;
          } else {
            location.reload();
          }
        });
      },

      // Call your server to finalize the transaction
      onApprove: function (data, actions) {
        return fetch(
            "/rest/payment/payPal/smart_payment/" +
            data.orderID +
            "/" +
            data.payerID +
            "/" +
            orderId +
            "/reinit_capture_order" +
            (appendTrailingSlash ? "/" : ""),
            {
              method: "post",
            }
        ).then(function (res) {
          return res.json();
        }).then(function (orderData) {
          $("#paypal_loading_screen").css("display", "block");
          location.reload();
        });
      },
      onCancel: function (data) {
        $("#paypal_loading_screen").css("display", "none");
      },
      style: {
        label: labelStyle,
        color: btnColor,
      },
      fundingSource: smartMethod,
    }).render("#paypal-button-reinit-container-"+orderId);
  }
};

window.checkFoundingSources = function checkFoundingSources() {
  const availableFoundingSources = new Map();
  paypal_plenty_sdk.getFundingSources().forEach(function (fundingSource) {
    availableFoundingSources.set(fundingSource, paypal_plenty_sdk.isFundingEligible(fundingSource));
  })

  return availableFoundingSources;
}

window.paypalValidateCheckout = function paypalValidateCheckout() {
  return new Promise((resolve, reject) => {
    try {
      var loadingScreen = document.getElementById("paypal_loading_screen");
      loadingScreen.style.display = "block";
      if (typeof window.ceresStore.state.checkout.validation.gtc.validate === "function") {
        window.ceresStore.state.checkout.validation.gtc.validate();
        if (window.ceresStore.state.checkout.validation.gtc.showError) {
          loadingScreen.style.display = "none";
          return reject();
        }
      }

      if (typeof window.ceresStore.state.checkout.validation.shippingProfile.validate === 'function') {
        window.ceresStore.state.checkout.validation.shippingProfile.validate();
        if (window.ceresStore.state.checkout.validation.shippingProfile.showError) {
          loadingScreen.style.display = "none";
          return reject();
        }
      }

      if (typeof window.ceresStore.state.checkout === 'object') {
        const params = {
          orderContactWish: window.ceresStore.state.checkout.contactWish,
          orderCustomerSign: window.ceresStore.state.checkout.customerSign,
          shippingPrivacyHintAccepted: window.ceresStore.state.checkout.shippingPrivacyHintAccepted,
        };

        let token = $("input[id=\"csrf-token\"]").val();
        return fetch(
            "/rest/io/order/additional_information" + (appendTrailingSlash ? "/" : ""),
            {
              headers: {'Content-Type': 'application/json', 'X-CSRF-TOKEN': token},
              method: "POST",
              body: JSON.stringify(params)
            }).then(function (res){
          return fetch(
              "/rest/io/checkout/payment" + (appendTrailingSlash ? "/" : ""),
              {
                headers: {'X-CSRF-TOKEN': token},
                method: "POST"
              }
          ).then(function (res) {
            resolve();
          }).catch((error) => {
            loadingScreen.style.display = "none";
            reject();
          })
        }).catch((error) => {
          loadingScreen.style.display = "none";
          reject();
        });
      }
    } catch (e) {
      loadingScreen.style.display = "none";
      return reject();
    }

    return resolve();
  });
}

paypalLoadScript({
  "client-id": clientId,
  "data-client-token": clientToken,
  "data-partner-attribution-id": "plentysystemsAG_Cart_PPCP",
  "data-namespace" : "paypal_plenty_sdk",
  currency: currency,
  locale: locale,
  components:
      "messages,buttons,funding-eligibility,hosted-fields,payment-fields,marks&enable-funding=paylater",
})
    .then((paypal_plenty_sdk) => {
      const availableFoundingSources = checkFoundingSources();
      return fetch(
          "/rest/payment/payPal/smart_payment/handle_founding_sources" + (appendTrailingSlash ? "/" : ""),
          {
            headers: {'Content-Type' : 'application/json'},
            method: "POST",
            body : JSON.stringify({'availableFoundingSources' : Object.fromEntries(availableFoundingSources)})
          }
      ).then(function (res) {
        return res;
      }).then(function (data) {
        document.dispatchEvent(new CustomEvent("payPalScriptInitialized", {}));
      });
    })
    .catch((error) => {
      console.error("failed to load the PayPal JS SDK script", error);
    });


window.initCreditCardFields = function initCreditCardFields(orderId = null)
{
  // Eligibility check for advanced credit and debit card payments
  if (paypal_plenty_sdk.HostedFields.isEligible())
  {
    let paypalOrderId;
    let paypalPayerId;
    let createOrderUrl;
    let captureOrderUrl;

    paypal_plenty_sdk.HostedFields.render({
      styles: {
        // Styling element state
        '.valid': {
          'color': 'green'
        },
        '.invalid': {
          'color': 'red'
        }
      },
      fields: {
        number: {
          selector: "#card-number",
          placeholder: "4111 1111 1111 1111"
        },
        cvv: {
          selector: "#cvv",
          placeholder: "123"
        },
        expirationDate: {
          selector: "#expiration-date",
          placeholder: "MM/YY"
        }
      },
      createOrder: function ()
      {
        openLoadingScreen();
        if (orderId) {
          createOrderUrl = "/rest/payment/payPal/smart_payment/" + orderId + "/reinit_create_order" + (appendTrailingSlash ? "/" : "");
        } else {
          createOrderUrl = "/rest/payment/payPal/smart_payment/create_order" + (appendTrailingSlash ? "/" : "");
        }
        return fetch(createOrderUrl, {
          method: 'post'
        }).then(function (res)
        {
          return res.json();
        }).then(function (paypalOrderData)
        {
          paypalOrderId = paypalOrderData.id;
          paypalPayerId = paypalOrderData.payPalPayerId;
          closeLoadingScreen();
          return paypalOrderId;
        });
      }
    }).then(function (hostedFields)
    {
      document.querySelector("#card-form").addEventListener('submit', (event) =>
      {
        event.preventDefault();
        $(document).find('#pay-container').closest('.modal.show').modal('hide');
        hostedFields.submit({
          cardholderName: $(document).find('#card-holder-name').value,
          contingencies: ['SCA_WHEN_REQUIRED']
        }).then(function (payload)
        {
          // Needed only when 3D Secure contingency applied
          if (payload.liabilityShift === "NO")
          {
            return actions.restart();
          }
          else if (payload.liabilityShift === "POSSIBLE" || sandbox)
          {
            openLoadingScreen();

            if (orderId) {
              captureOrderUrl = "/rest/payment/payPal/smart_payment/" + paypalOrderId + "/" + paypalPayerId + "/" + orderId + "/reinit_capture_order"  + (appendTrailingSlash ? "/" : "");
            } else {
              captureOrderUrl = "/rest/payment/payPal/smart_payment/" + paypalOrderId + "/" + paypalPayerId + "/capture_order"  + (appendTrailingSlash ? "/" : "");
            }

            fetch(captureOrderUrl, {
              method: 'post'
            }).then(function (res)
            {
              return res.json();
            }).then(function (orderData)
            {
              var errorDetail = Array.isArray(orderData.details) && orderData.details[0];
              if (errorDetail && errorDetail.issue === 'INSTRUMENT_DECLINED')
              {
                closeLoadingScreen();
                return actions.restart(); // Recoverable state, per:
              }
              // Show a success message or redirect
              window.location.href = orderData.url
            })
          }

          if (payload.liabilityShift)
          {
            // Handle buyer confirmed 3D Secure successfully
            //console.log("HANDLE BUYER CONFIRMED");
          }
        }).catch(function (err)
        {
          fetch('/rest/payment/payPal/smart_payment/create_error'  + (appendTrailingSlash ? "/" : ""), {
            method: 'post',
            body: JSON.stringify(err)
          }).then(res =>
          {
            location.reload()
          });
        });
      });
    });
  }
  else
  {
    // hides the advance
    // credit and debit card payments fields, if merchant isn't eligible
    confirmCancel();
  }
}

window.confirmCancel = function confirmCancel()
{
  $(document).find('#pay-container').closest('.modal.show').modal('hide');
  location.reload();
}

window.openLoadingScreen = function openLoadingScreen()
{
  $("#paypal_loading_screen").css('display', 'block')
}

window.closeLoadingScreen = function closeLoadingScreen()
{
  $("#paypal_loading_screen").css('display', 'none')
}