import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

var surveyTemplate, questions;

moduleForAcceptance('Acceptance | survey template', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
    questions = server.createList('question', 5, { surveyTemplate });
  }
});

test('visiting /survey_templates/:id', function(assert) {
  visit(`/survey_templates/${surveyTemplate.id}`);

  andThen(function() {
    assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}`);
  });
});

test('displaying survey template info', function(assert) {
  visit(`/survey_templates/${surveyTemplate.id}`);
  andThen(function() {
    assert.equal(surveyTemplate.name,find('[data-test="surveyTemplate.name"]').text().trim());
    assert.equal(surveyTemplate.status,find('[data-test="surveyTemplate.status"]').text().trim());
  });
});

test('listing questions', function(assert) {
  visit(`/survey_templates/${surveyTemplate.id}`);
  andThen(function() {
    for (var question of questions) {
      assert.equal(question.question_text,find(`[data-question-id="${question.id}"] [data-test="question.questionText"]`).text().trim());
    }
  });
});

test('editing a survey template', function(assert) {
  visit(`/survey_templates/${surveyTemplate.id}`);
  click('[data-test="edit-survey-link"]').then(()=>{
    assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}/edit`);
    fillIn('[data-test="surveyTemplate.name"]', 'Yo te vi salir campeón del continente');
    click('[data-test="save-survey-template-link"]').then(()=>{
      surveyTemplate = server.db.surveyTemplates.find(surveyTemplate.id);
      assert.equal(surveyTemplate.name, 'Yo te vi salir campeón del continente');
      assert.equal(currentURL(), `/survey_templates/${surveyTemplate.id}`);
    });
  });
});