import { expect } from 'chai';
import '../../../src/lib/controller/SearchNote';
import { SearchNote } from '../../../src/lib/controller/SearchNote';
import { ConfiguredLogger } from '../../../src/lib/logger/ConfigurableLogger';
import { stubInterface } from 'ts-sinon';
import { Searchable } from '../../../src/interface/Searchable';
import express from 'express';
import { Session } from '../../../src/interface/Session';

describe('search', function () {
  it('unauthorized', async function () {
    const dummySearch = stubInterface<Searchable>();
    const dummySession = stubInterface<Session>();
    const dummyRequest = stubInterface<express.Request>();
    const dummyResponse = stubInterface<express.Response>();
    await new SearchNote(
      new ConfiguredLogger(),
      dummySearch,
      dummySearch,
      dummySession
    ).search(dummyRequest, dummyResponse);
    expect(dummyResponse.statusCode).to.equal(401);
  });

  it('invalidsession', async function () {
    const dummySearch = stubInterface<Searchable>();
    const dummyRequest = stubInterface<express.Request>();
    const dummySession = stubInterface<Session>();
    dummyRequest.headers.cookie =
      'LEANOTE_SESSION=some-cookie; Path=/; HttpOnly';
    const dummyResponse = stubInterface<express.Response>();
    await new SearchNote(
      new ConfiguredLogger(),
      dummySearch,
      dummySearch,
      dummySession
    ).search(dummyRequest, dummyResponse);
    expect(dummyResponse.statusCode).to.equal(401);
  });

  it('empty', async function () {
    const dummySearch = stubInterface<Searchable>();
    const dummyRequest = stubInterface<express.Request>();
    dummyRequest.headers.cookie =
      'LEANOTE_SESSION=some-cookie; Path=/; HttpOnly';
    const dummyResponse = stubInterface<express.Response>();
    const validateAnyCookie = stubInterface<Session>({
      isSessionValid: Promise.resolve(true)
    });
    await new SearchNote(
      new ConfiguredLogger(),
      dummySearch,
      dummySearch,
      validateAnyCookie
    ).search(dummyRequest, dummyResponse);
    expect(dummyResponse.statusCode).to.equal(400);
  });

  it('keyword', async function () {
    const keyword = 'SomeKeywordToSearch';
    const dummySearch = stubInterface<Searchable>();
    const makeSureItSearchForKeyword = stubInterface<Searchable>();
    const incommingRequestToSearchKeyword = stubInterface<express.Request>();
    incommingRequestToSearchKeyword.headers.cookie =
      'LEANOTE_SESSION=some-cookie; Path=/; HttpOnly';
    incommingRequestToSearchKeyword.body.key = keyword;
    const dummyResponse = stubInterface<express.Response>();
    const validateAnyCookie = stubInterface<Session>({
      isSessionValid: Promise.resolve(true)
    });
    await new SearchNote(
      new ConfiguredLogger(),
      makeSureItSearchForKeyword,
      dummySearch,
      validateAnyCookie
    ).search(incommingRequestToSearchKeyword, dummyResponse);
    expect(
      makeSureItSearchForKeyword.search.getCalls()[0].firstArg.Match
    ).to.equal(keyword);
  });
});
