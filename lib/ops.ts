import Stripe from 'stripe';
import { ErrorResponse, CustomerOpResponse, StripeAccountData, Metadata } from './typedefs';
import { emailFromUsername } from './utils';
import { syncMetadata, readBlockOrder } from './metadataUtils';
const LOGSYM = '🔄';

const logCustomerOp = (name: string, response: CustomerOpResponse) => {
  let logResponse = response as any;
  if (!response.errored) {
    const customer = response.data as Stripe.Customer;
    logResponse = { metadata: customer.metadata };
  }
  let sym = LOGSYM;
  if (name.startsWith('get')) {
    sym = '⬅️';
  }
  if (name.startsWith('update')) {
    sym = '⤴️';
  }
  console.log(`${sym} ${name}`, JSON.stringify(logResponse, null, 2));
};

/**
 * Get or create a Stripe customer.
 * Default behavior: creates a customer on the Flexjar platform account,
 * using the session user's *username*.
 * If stripeAccountId is provided, creates a customer on the the connected account,
 * using the sesssion user's *email*
 */
export const getOrCreateCustomer = async (
  session: any,
  allowCreate: boolean = false,
  stripeAccountId: string | null = null,
): Promise<CustomerOpResponse> => {
  let customer: Stripe.Customer | null = null;
  let errorResponse: ErrorResponse | null = null;
  if (!session || !session.user || !session.user.username) {
    errorResponse = {
      httpStatus: 401,
      errorMessage: `Invalid session: ${JSON.stringify(session)}`,
      errorCode: 'invalid_session',
    };
  } else {
    const username = session.user.username;
    let customerEmail = emailFromUsername(username);
    if (stripeAccountId) {
      customerEmail = session.user.email;
    }
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      let opts = null;
      if (stripeAccountId) {
        opts = { stripeAccount: stripeAccountId };
      }
      const response = await stripe.customers.list({ email: customerEmail }, opts);
      if (response.data.length > 0) {
        customer = response.data[0];
      }
      if (!customer && allowCreate && session.user) {
        const metadata = {
          email: session.user.email,
          name: session.user.name,
          profile_image: session.user.picture,
          twitter_username: session.user.username,
        };
        customer = await stripe.customers.create(
          {
            email: customerEmail,
            metadata: metadata,
          },
          opts,
        );
      }
      if (!customer) {
        errorResponse = {
          httpStatus: 404,
          errorMessage: 'No user data found',
          errorCode: 'customer_not_found',
        };
      }
    } catch (e) {
      errorResponse = {
        httpStatus: 500,
        errorMessage: e.message,
        errorCode: 'stripe_exception',
      };
    }
  }
  const response = {
    errored: errorResponse != null,
    data: errorResponse ? errorResponse : customer,
  };
  logCustomerOp('getOrCreateCustomer', response);
  return response;
};

export const getCustomer = async (username: string): Promise<CustomerOpResponse> => {
  let customer: Stripe.Customer | null = null;
  let errorResponse: ErrorResponse | null = null;
  const jarEmail = emailFromUsername(username);
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const response = await stripe.customers.list({ email: jarEmail });
    if (response.data.length > 0) {
      customer = response.data[0];
    } else {
      errorResponse = {
        httpStatus: 404,
        errorMessage: 'No user data found',
        errorCode: 'customer_not_found',
      };
    }
  } catch (e) {
    errorResponse = {
      httpStatus: 500,
      errorMessage: e.message,
      errorCode: 'stripe_exception',
    };
  }
  const response = {
    errored: errorResponse != null,
    data: errorResponse ? errorResponse : customer,
  };
  logCustomerOp('getOrCreateCustomer', response);
  return response;
};

// UPDATE METADATA

export const updateMetadataForCustomerId = async (
  session: any,
  customerId: string | null,
  metadata: Stripe.Metadata,
): Promise<CustomerOpResponse> => {
  return updateCustomerMetadata(session, customerId, null, metadata);
};

export const updateMetadataForCustomer = async (
  session: any,
  customer: Stripe.Customer | null,
  metadata: Stripe.Metadata,
): Promise<CustomerOpResponse> => {
  return updateCustomerMetadata(session, null, customer, metadata);
};

// get a customer. if signed in, create a customer if it doesn't exist.
const updateCustomerMetadata = async (
  session: any,
  customerId: string | null,
  customer: Stripe.Customer | null,
  metadata: Stripe.Metadata,
): Promise<CustomerOpResponse> => {
  let errorResponse: ErrorResponse | null = null;
  let customerResponse: Stripe.Customer | null = null;
  if (!customerId && !customer) {
    errorResponse = {
      httpStatus: 400,
      errorMessage: 'Bad request',
      errorCode: 'no_customer_or_id',
    };
  }
  if (!session || !session.user || !session.user.username) {
    errorResponse = {
      httpStatus: 401,
      errorMessage: 'Invalid session',
      errorCode: 'invalid_session',
    };
  }
  const username = session.user.username;
  const expectedEmail = emailFromUsername(username);
  if (customer && expectedEmail !== customer.email) {
    errorResponse = {
      httpStatus: 401,
      errorMessage: `Permission denied: ${expectedEmail} !== ${customer.email}`,
      errorCode: 'session_user_not_customer',
    };
  }
  if (!errorResponse) {
    const getResponse = await getOrCreateCustomer(session);
    if (getResponse.errored) {
      errorResponse = getResponse.data as ErrorResponse;
    } else {
      const remoteCustomer = getResponse.data as Stripe.Customer;
      const remoteMetadata = remoteCustomer.metadata;
      const mergedMetadata = syncMetadata(metadata, remoteMetadata);

      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        let cid = customerId;
        if (!cid && customer) {
          cid = customer.id;
        }
        if (cid) {
          customerResponse = await stripe.customers.update(cid, { metadata: mergedMetadata });
        }
      } catch (e) {
        errorResponse = {
          httpStatus: 500,
          errorMessage: e.message,
          errorCode: 'stripe_exception',
        };
      }
    }
  }
  const response = {
    errored: errorResponse != null,
    data: errorResponse ? errorResponse : customerResponse,
  };
  logCustomerOp(customerId ? 'updateMetadataForCustomerId' : 'updateMetadataForCustomer', response);
  return response;
};

// Stripe Standard connect account setup

export const connectStripeAccount = async (session: any, state: string, code: string): Promise<CustomerOpResponse> => {
  let customerResponse: Stripe.Customer | null = null;
  let errorResponse: ErrorResponse | null = null;
  if (!session || !session.user || !session.user.username) {
    errorResponse = {
      httpStatus: 401,
      errorMessage: `Invalid session: ${JSON.stringify(session)}`,
      errorCode: 'invalid_session',
    };
  } else if (state !== session.user.username) {
    errorResponse = {
      httpStatus: 401,
      errorMessage: `Permission denied: ${state} !== ${session.user.username}`,
      errorCode: 'session_user_state_mismatch',
    };
  } else {
    // assumption: a customer already exists (doesn't allow create)
    const getResponse = await getOrCreateCustomer(session);
    if (getResponse.errored) {
      errorResponse = getResponse.data as ErrorResponse;
    } else {
      const customer = getResponse.data as Stripe.Customer;
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const oauthResponse = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code: code,
      });
      const stripeAccountId = oauthResponse.stripe_user_id;
      const stripeAccount = await stripe.accounts.retrieve(stripeAccountId);
      let businessName = stripeAccount.settings.dashboard.display_name;
      if (stripeAccount.business_profile && stripeAccount.business_profile.name) {
        businessName = stripeAccount.business_profile.name;
      }

      const accountData: StripeAccountData = {
        id: stripeAccountId,
        name: businessName,
        email: stripeAccount.email,
      };
      console.dir(accountData);
      // Note: PaymentBlock gets reset after disconnecting & reconnecting Stripe
      const paymentBlockData = {
        text: 'Leave me a tip',
        defaultAmount: 500,
      };

      // update customer
      const metadata = {
        stripeAccount: JSON.stringify(accountData),
        'b.payment': JSON.stringify(paymentBlockData),
      };
      const updateResponse = await updateMetadataForCustomer(session, customer, metadata);
      if (updateResponse.errored) {
        errorResponse = updateResponse.data as ErrorResponse;
      }
      customerResponse = updateResponse.data as Stripe.Customer;
    }
  }
  const response = {
    errored: errorResponse != null,
    data: errorResponse ? errorResponse : customerResponse,
  };
  logCustomerOp('connectStripeAccount', response);
  return response;
};

export const disconnectStripeAccount = async (session: any): Promise<CustomerOpResponse> => {
  let customerResponse: Stripe.Customer | null = null;
  let errorResponse: ErrorResponse | null = null;
  if (!session || !session.user || !session.user.username) {
    errorResponse = {
      httpStatus: 401,
      errorMessage: `Invalid session: ${JSON.stringify(session)}`,
      errorCode: 'invalid_session',
    };
  } else {
    // assumption: a customer already exists
    const getResponse = await getOrCreateCustomer(session);
    if (getResponse.errored) {
      errorResponse = getResponse.data as ErrorResponse;
    } else {
      const customer = getResponse.data as Stripe.Customer;
      const metadata = {
        stripeAccount: null,
      };
      const updateResponse = await updateMetadataForCustomer(session, customer, metadata);
      if (updateResponse.errored) {
        errorResponse = updateResponse.data as ErrorResponse;
      }
      customerResponse = updateResponse.data as Stripe.Customer;
    }
  }
  const response = {
    errored: errorResponse != null,
    data: errorResponse ? errorResponse : customerResponse,
  };
  logCustomerOp('disconnectStripeAccount', response);
  return response;
};
