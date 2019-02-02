# RTE texts need to bo editable at HTMLElement level (span, b, i ...)

-   Making inline elements (B, I, U) be a specific type (by extending text)
    will cause the rte actions (ex. bold) to wrap the element in a span
    when toggling the formatting.
    
-   rte.insertHTML will correctly handle nested spans and crossing the
    boundary between other elements

-   Types that are already defined do not inherit from extended Types
    ex. Link wont get extendedText changes
    
-   Methods for getting selection and creating range from mouse event are on all
    view prototypes
