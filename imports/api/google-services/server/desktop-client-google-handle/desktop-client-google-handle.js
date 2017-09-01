/**
 * Created by yukinohito on 2/1/17.
 */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Random } from 'meteor/random';
import GoogleAuth from 'google-auth-library';
import Future from 'fibers/future';

Meteor.methods({
  verifyGoogleAuthId: function(data) {
    // add test user if not present yet
    const me = Meteor.users.findOne({'emails.address': data.email});
	if(typeof me === 'undefined') {
	  Accounts.createUser({
	    email: data.email,
		password: '123456'
	  });
	}
	const oneDay = 1000 * 3600 * 24;
    const userId = getUserId(data.email);
    verifyGoogleIdToken(data.id_token, data.clientId);
	const token = Random.secret(32);
	const expires = Date.now() + oneDay;
    clearUserToken(userId, data.clientAppId);
    pushUserToken(userId, data.clientAppId, token, expires);
	return {
	  userId,
	  token,
	  expires
	}
  }
});

function getUserId(email) {
  const user = Meteor.users.findOne({'emails.address': email}, {_id: 1});
  if(typeof user === 'undefined') {
    throw new Meteor.Error('User not found');
  } else {
    return user._id;
  }
}

function verifyGoogleIdToken(token, clientId) {
  let syncVerifyIdToken = new Future();
  const auth = new GoogleAuth();
  const client = new auth.OAuth2(clientId, '', '');
  client.verifyIdToken(token, clientId, (err, login) => {
    if(err) {
	  syncVerifyIdToken.throw(err);
	} else {
	  syncVerifyIdToken.return();
	}
  });
  return syncVerifyIdToken.wait();
}

function clearUserToken(userId, clientAppId) {
   let syncClearUserToken = new Future();
   Meteor.users.update({_id: userId, 'clientTokens.clientAppId': clientAppId}, {
     $pull: {
	   clientTokens: {}
	 }
   }, err => {
     if(err) {
	   syncClearUserToken.throw(err);
	 } else {
	   syncClearUserToken.return();
	 }
   });
   return syncClearUserToken.wait();
}

function pushUserToken(userId, clientAppId, token, expires) {
  let syncPushUserToken = new Future();
  Meteor.users.update(userId, {
    $push: {
	  clientTokens: {
	    token,
		expires,
		clientAppId,
        lastUpdatedAt: Date.now()
	  }
	}
  }, err => {
    if(err) {
	  syncPushUserToken.throw(err);
	} else {
	  syncPushUserToken.return();
	}
  });
  return syncPushUserToken.wait();
}

