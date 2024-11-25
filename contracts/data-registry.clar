;; Data Registry Contract

(define-data-var next-data-id uint u0)

(define-map data-records uint
  {
    owner: principal,
    data-type: (string-ascii 64),
    description: (string-ascii 256),
    price: uint,
    quality-score: uint,
    creation-date: uint
  }
)

(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-UNAUTHORIZED (err u403))

(define-public (register-data (data-type (string-ascii 64)) (description (string-ascii 256)) (price uint))
  (let
    (
      (data-id (var-get next-data-id))
    )
    (map-set data-records data-id
      {
        owner: tx-sender,
        data-type: data-type,
        description: description,
        price: price,
        quality-score: u0,
        creation-date: block-height
      }
    )
    (var-set next-data-id (+ data-id u1))
    (ok data-id)
  )
)

(define-public (update-data-price (data-id uint) (new-price uint))
  (let
    (
      (data (unwrap! (map-get? data-records data-id) ERR-NOT-FOUND))
    )
    (asserts! (is-eq tx-sender (get owner data)) ERR-UNAUTHORIZED)
    (ok (map-set data-records data-id
      (merge data { price: new-price })
    ))
  )
)

(define-read-only (get-data-record (data-id uint))
  (ok (unwrap! (map-get? data-records data-id) ERR-NOT-FOUND))
)

(define-public (update-quality-score (data-id uint) (new-score uint))
  (let
    (
      (data (unwrap! (map-get? data-records data-id) ERR-NOT-FOUND))
    )
    ;; In a real-world scenario, we'd want to restrict this function to authorized quality assessors
    (ok (map-set data-records data-id
      (merge data { quality-score: new-score })
    ))
  )
)

