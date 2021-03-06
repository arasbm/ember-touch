
var set = Em.set;
var get = Em.get;

var view, gestures, View;
var application;
var period = 200;
var viewEvent;
var endCalled = false;
var moveThreshold = 40;

module("Touch Hold Test",{
  setup: function() {
    endCalled = false;

    View = Em.View.extend({
      
      elementId: 'gestureTest',

      touchHoldOptions: {
        holdPeriod: period,
        moveThreshold: moveThreshold
      },

      touchHoldEnd: function(recognizer, evt) {
        endCalled = true;
        viewEvent = evt; 
      }

    });

    Em.run(function(){

      application = Em.Application.create({
        ready: function() {
          view = View.create();
          view.append();
          start();
        }
      });
      stop();
    });
  },

  teardown: function() {

    var touchEvent = new jQuery.Event();
    touchEvent.type='touchend';
    touchEvent['originalEvent'] = {
      targetTouches: [],
      changedTouches: []
    };
    view.$().trigger(touchEvent);
    view.destroy();

    Em.run(function(){
      application.destroy();
    });
  }
});

test("one start event should put it in began state", function() {
  var touchEvent = jQuery.Event('touchstart');
  touchEvent['originalEvent'] = {
    targetTouches: [{
      pageX: 0,
      pageY: 10
    }]
  };

  view.$().trigger(touchEvent);

  var gestures = get(get(view, 'eventManager'), 'gestures');

  ok(gestures);
  equal(gestures.length,1);
  equal(get(gestures[0], 'state'),Em.Gesture.BEGAN, "gesture should be began");
});

test("without touch ends after the period, touchHoldEnd should have been fired and ENDED", function() {

  var touchEvent = new jQuery.Event();
  touchEvent.type='touchstart';
  touchEvent['originalEvent'] = {
    targetTouches: [{
      pageX: 0,
      pageY: 10
    }]
  };

  view.$().trigger(touchEvent);

  stop();  
  
  setTimeout(function() {  

      gestures = get(get(view, 'eventManager'), 'gestures');

      ok(endCalled,'touch press should be ended');
      ok(gestures, "gestures should exist");
      equal(gestures.length,1,"there should be one gesture");
      equal(get(gestures[0], 'state'),Em.Gesture.ENDED, "gesture should be ended");
      equal( viewEvent.type , Em.TimeoutTouchEventType.End, 'Gesture is ended via an Em.TimeoutTouchEvent');

      start();  

  }, period);

});


test("with touch ends after the period, touchHoldEnd should have been fired and ENDED", function() {

  var touchEvent = new jQuery.Event();
  touchEvent.type='touchstart';
  touchEvent['originalEvent'] = {
    targetTouches: [{
      pageX: 0,
      pageY: 10
    }]
  };

  view.$().trigger(touchEvent);

  stop();  
  
  setTimeout(function() {  

      touchEvent = new jQuery.Event();
      touchEvent.type='touchend';
      touchEvent['originalEvent'] = {
        changedTouches: [{
          pageX: 0,
          pageY: 10
        }]
      };

      view.$().trigger(touchEvent);

      gestures = get(get(view, 'eventManager'), 'gestures');

      ok(endCalled,'touch press should be ended');
      ok(gestures, "gestures should exist");
      equal(gestures.length,1,"there should be one gesture");
      equal(get(gestures[0], 'state'),Em.Gesture.ENDED, "gesture should be ended");

      start();  

  }, period + 100);

});


test("with touch ends before the period, touchHoldEnd should not fire and CANCELLED state", function() {


  var touchEvent = new jQuery.Event();
  touchEvent.type='touchstart';
  touchEvent['originalEvent'] = {
    targetTouches: [{
      pageX: 0,
      pageY: 10
    }]
  };

  view.$().trigger(touchEvent);

  touchEvent = new jQuery.Event();
  touchEvent.type='touchend';
  touchEvent['originalEvent'] = {
    changedTouches: [{
      pageX: 0,
      pageY: 10
    }]
  };

  view.$().trigger(touchEvent);

  gestures = get(get(view, 'eventManager'), 'gestures');

  ok(!endCalled,'touch press should be ended');
  ok(gestures, "gestures should exist");
  equal(gestures.length,1,"there should be one gesture");
  equal(get(gestures[0], 'state'),Em.Gesture.CANCELLED, "gesture should be canceled");


});


test("when move less than moveThreshold, touchHoldEnd should be fired", function() {

  var touchEvent = new jQuery.Event();
  touchEvent.type='touchstart';
  touchEvent['originalEvent'] = {
    targetTouches: [{
      identifier: 0,
      pageX: 0,
      pageY: 10
    }]
  };

  view.$().trigger(touchEvent);

  touchEvent = new jQuery.Event();
  touchEvent.type='touchmove';
  touchEvent['originalEvent'] = {
    changedTouches: [{
      identifier: 0,
      pageX: 5,
      pageY: 10
    }]
  };

  view.$().trigger(touchEvent);

  stop();  

  
  setTimeout(function() {  

      gestures = get(get(view, 'eventManager'), 'gestures');

      ok(endCalled,'touch press should be ended');
      ok(gestures, "gestures should exist");
      equal(gestures.length,1,"there should be one gesture");
      equal(get(gestures[0], 'state'),Em.Gesture.ENDED, "gesture should be ended");

      start();  

  }, period + 100);


});


test("when move more than moveThreshold, touchHoldEnd should not be fired and CANCELLED", function() {

  var touchEvent = new jQuery.Event();
  touchEvent.type='touchstart';
  touchEvent['originalEvent'] = {
    targetTouches: [{
      identifier: 0,
      pageX: 0,
      pageY: 10
    }]
  };

  view.$().trigger(touchEvent);

  touchEvent = new jQuery.Event();
  touchEvent.type='touchmove';
  touchEvent['originalEvent'] = {
    changedTouches: [{
      identifier: 0,
      pageX: 50,
      pageY: 50
    }]
  };

  view.$().trigger(touchEvent);

  stop();  

  
  setTimeout(function() {  

      gestures = get(get(view, 'eventManager'), 'gestures');

      ok(!endCalled,'touch press should be ended');
      ok(gestures, "gestures should exist");
      equal(gestures.length,1,"there should be one gesture");
      equal(get(gestures[0], 'state'),Em.Gesture.CANCELLED);

      start();  

  }, period + 100);


});



