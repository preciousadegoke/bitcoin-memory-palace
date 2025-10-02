;; Bitcoin Memory Palace - Core Contract
;; Stores memory fragments and collective insights

;; Error constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-FRAGMENT-TOO-LONG (err u101))
(define-constant ERR-INVALID-CATEGORY (err u102))

;; Data variables
(define-data-var contract-owner principal tx-sender)
(define-data-var fragment-counter uint u0)
(define-data-var insight-counter uint u0)

;; Memory Fragment Storage
(define-map memory-fragments
  { fragment-id: uint }
  {
    author: principal,
    content: (string-utf8 280),
    category: (string-ascii 50),
    location: (optional (string-ascii 100)),
    timestamp: uint,
    confidence-score: uint,
    validation-count: uint
  }
)

;; Collective Insights Registry
(define-map collective-insights
  { insight-id: uint }
  {
    pattern: (string-utf8 500),
    supporting-fragments: (list 10 uint),
    accuracy-score: uint,
    creation-time: uint,
    creator: principal
  }
)

;; User Reputation System
(define-map user-stats
  { user: principal }
  {
    fragments-contributed: uint,
    insights-generated: uint,
    reputation-score: uint,
    memory-tokens: uint
  }
)

;; Fragment Categories
(define-map valid-categories
  { category: (string-ascii 50) }
  { active: bool }
)

;; Initialize valid categories
(map-set valid-categories { category: "adoption" } { active: true })
(map-set valid-categories { category: "payment" } { active: true })
(map-set valid-categories { category: "defi" } { active: true })
(map-set valid-categories { category: "experience" } { active: true })
(map-set valid-categories { category: "insight" } { active: true })

;; Public Functions

;; Submit a memory fragment
(define-public (submit-fragment (content (string-utf8 280)) 
                               (category (string-ascii 50))
                               (location (optional (string-ascii 100))))
  (let ((fragment-id (+ (var-get fragment-counter) u1))
        (current-time (unwrap-panic (get-stacks-block-info? time (- stacks-block-height u1)))))
    (asserts! (<= (len content) u280) ERR-FRAGMENT-TOO-LONG)
    (asserts! (is-some (map-get? valid-categories { category: category })) ERR-INVALID-CATEGORY)
    
    ;; Store the fragment
    (map-set memory-fragments 
      { fragment-id: fragment-id }
      {
        author: tx-sender,
        content: content,
        category: category,
        location: location,
        timestamp: current-time,
        confidence-score: u50,
        validation-count: u0
      }
    )
    
    ;; Update counters and user stats
    (var-set fragment-counter fragment-id)
    (update-user-stats tx-sender u1 u0 u10 u1)
    
    (ok fragment-id)
  )
)

;; Submit a collective insight
(define-public (submit-insight (pattern (string-utf8 500))
                              (supporting-fragments (list 10 uint)))
  (let ((insight-id (+ (var-get insight-counter) u1))
        (current-time (unwrap-panic (get-stacks-block-info? time (- stacks-block-height u1)))))
    
    ;; Store the insight
    (map-set collective-insights
      { insight-id: insight-id }
      {
        pattern: pattern,
        supporting-fragments: supporting-fragments,
        accuracy-score: u75,
        creation-time: current-time,
        creator: tx-sender
      }
    )
    
    ;; Update counters and user stats
    (var-set insight-counter insight-id)
    (update-user-stats tx-sender u0 u1 u25 u5)
    
    (ok insight-id)
  )
)

;; Validate a fragment (increases confidence)
(define-public (validate-fragment (fragment-id uint))
  (match (map-get? memory-fragments { fragment-id: fragment-id })
    fragment-data 
    (begin
      (map-set memory-fragments 
        { fragment-id: fragment-id }
        (merge fragment-data { 
          validation-count: (+ (get validation-count fragment-data) u1),
          confidence-score: (min (+ (get confidence-score fragment-data) u10) u100)
        })
      )
      (update-user-stats tx-sender u0 u0 u5 u1)
      (ok true)
    )
    (err u404)
  )
)

;; Private Functions

;; Update user statistics
(define-private (update-user-stats (user principal) 
                                  (fragments uint) 
                                  (insights uint) 
                                  (reputation uint) 
                                  (tokens uint))
  (let ((current-stats (default-to 
                         { fragments-contributed: u0, insights-generated: u0, reputation-score: u0, memory-tokens: u0 }
                         (map-get? user-stats { user: user }))))
    (map-set user-stats 
      { user: user }
      {
        fragments-contributed: (+ (get fragments-contributed current-stats) fragments),
        insights-generated: (+ (get insights-generated current-stats) insights),
        reputation-score: (+ (get reputation-score current-stats) reputation),
        memory-tokens: (+ (get memory-tokens current-stats) tokens)
      }
    )
  )
)

;; Read-only Functions

;; Get fragment by ID
(define-read-only (get-fragment (fragment-id uint))
  (map-get? memory-fragments { fragment-id: fragment-id })
)

;; Get insight by ID
(define-read-only (get-insight (insight-id uint))
  (map-get? collective-insights { insight-id: insight-id })
)

;; Get user stats
(define-read-only (get-user-stats (user principal))
  (map-get? user-stats { user: user })
)

;; Get total fragment count
(define-read-only (get-fragment-count)
  (var-get fragment-counter)
)

;; Get total insight count
(define-read-only (get-insight-count)
  (var-get insight-counter)
)