// tests/fixtures/fixture-chapter.js
// A minimal valid chapter, used only by the validator's self-test.
var FIXTURE_LECTURE = {
  id: 99,
  name: 'Fixture Chapter',
  shortName: 'Fixture',
  sections: [
    {
      heading: 'Fixture section',
      items: [
        {
          id: 'l99-alpha',
          type: 'definition',
          term: 'Alpha',
          body: 'The first fixture item.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l99-beta',
          type: 'formula',
          term: 'Beta',
          body: 'The second fixture item, which carries a formula.',
          formula: 'f_s > 2 f_{max}',
          symbols: 'f_s is the sampling rate; f_max is the highest frequency present in the signal.',
          crossRef: ['information-loss']
        }
      ]
    }
  ]
};

var FIXTURE_QUESTIONS = [
  {
    id: 'l99-001',
    lecture: 99,
    topic: 'fixture',
    mode: 'mc',
    question: 'Which fixture item carries a formula?',
    options: ['Alpha', 'Beta', 'Neither', 'Both'],
    correctIndex: 1,
    answer: 'Beta carries the formula.',
    contentRef: 'l99-beta'
  },
  {
    id: 'l99-002',
    lecture: 99,
    topic: 'fixture',
    mode: 'short',
    question: 'State what the fixture proves.',
    answer: 'That the validator accepts well-formed data.',
    contentRef: 'l99-alpha'
  }
];

if (typeof module !== 'undefined') {
  module.exports = {
    FIXTURE_LECTURE: FIXTURE_LECTURE,
    FIXTURE_QUESTIONS: FIXTURE_QUESTIONS
  };
}
