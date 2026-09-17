package service

import (
	"sync"
	"time"
)

const limiterSweepThreshold = 10000

type LoginLimiter struct {
	mu          sync.Mutex
	maxFailures int
	window      time.Duration
	failures    map[string][]time.Time
	now         func() time.Time
}

func NewLoginLimiter(maxFailures int, window time.Duration) *LoginLimiter {
	return &LoginLimiter{
		maxFailures: maxFailures,
		window:      window,
		failures:    make(map[string][]time.Time),
		now:         time.Now,
	}
}

func (l *LoginLimiter) RetryAfter(key string) time.Duration {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := l.now()
	recent := l.prune(key, now)
	if len(recent) < l.maxFailures {
		return 0
	}
	return recent[len(recent)-l.maxFailures].Add(l.window).Sub(now)
}

func (l *LoginLimiter) RecordFailure(key string) {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := l.now()
	if len(l.failures) >= limiterSweepThreshold {
		for existing := range l.failures {
			l.prune(existing, now)
		}
	}
	l.failures[key] = append(l.prune(key, now), now)
}

func (l *LoginLimiter) Reset(key string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	delete(l.failures, key)
}

func (l *LoginLimiter) prune(key string, now time.Time) []time.Time {
	attempts := l.failures[key]
	cutoff := now.Add(-l.window)
	start := 0
	for start < len(attempts) && !attempts[start].After(cutoff) {
		start++
	}
	if start == len(attempts) {
		delete(l.failures, key)
		return nil
	}
	attempts = attempts[start:]
	l.failures[key] = attempts
	return attempts
}
